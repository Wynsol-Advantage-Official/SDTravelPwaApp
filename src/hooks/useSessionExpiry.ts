"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { onIdTokenChanged, signOut as fbSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

// ── Constants ─────────────────────────────────────────────────────────────────

/** Show the warning prompt this many ms before the token actually expires (2 min). */
const WARN_BEFORE_MS = 2 * 60 * 1000

/** How many seconds the user has to respond before auto-logout. */
const AUTO_LOGOUT_SECS = 60

// ── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Decode the `exp` field from a raw JWT string.
 * Returns the expiry as epoch ms, or null if the token can't be parsed.
 * Uses `atob` (browser) not `Buffer` (Node) so this is safe in client components.
 */
function getTokenExpMs(rawToken: string): number | null {
  try {
    const parts = rawToken.split(".")
    if (parts.length !== 3) return null

    // base64url → base64 with standard padding
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=")
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>

    return typeof payload.exp === "number" ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SessionExpiryState {
  /** True when the "session expiring" prompt should be shown. */
  showPrompt: boolean
  /** Seconds remaining until auto-logout (counts 60 → 0). */
  countdown: number
  /** Force-refresh the Firebase token and dismiss the prompt. */
  stayLoggedIn: () => Promise<void>
  /** Sign out immediately. */
  logOut: () => Promise<void>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Monitors the Firebase ID token lifecycle.
 *
 * - Schedules a prompt 2 minutes before the token expires.
 * - Starts a 60-second countdown when the prompt appears.
 * - Auto-logs out when countdown reaches zero.
 * - "Stay logged in" force-refreshes the token (clears the prompt and resets
 *   the warning timer via the resulting `onIdTokenChanged` event).
 *
 * NOTE: This hook does NOT sync the session cookie — that is handled by
 * `useAuth` (which uses `onIdTokenChanged` for cookie sync).
 */
export function useSessionExpiry(): SessionExpiryState {
  const [showPrompt, setShowPrompt] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_LOGOUT_SECS)

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Guard against double-calling logout (e.g. countdown hits 0 + user clicks)
  const logoutCalledRef = useRef(false)

  // ── Logout ────────────────────────────────────────────────────────────────

  const logOut = useCallback(async () => {
    if (logoutCalledRef.current) return
    logoutCalledRef.current = true

    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current)
      warnTimerRef.current = null
    }
    setShowPrompt(false)

    await fbSignOut(auth)
    // Session cookie is cleared via the onIdTokenChanged(null) path in useAuth
  }, [])

  // ── Auto-logout when countdown hits zero ──────────────────────────────────

  useEffect(() => {
    if (showPrompt && countdown === 0) {
      void logOut()
    }
  }, [showPrompt, countdown, logOut])

  // ── Countdown interval (only while prompt is visible) ─────────────────────

  useEffect(() => {
    if (!showPrompt) return

    setCountdown(AUTO_LOGOUT_SECS)

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [showPrompt])

  // ── Token change listener ─────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      // A token change (refresh or sign-out) resets everything
      if (warnTimerRef.current) {
        clearTimeout(warnTimerRef.current)
        warnTimerRef.current = null
      }
      setShowPrompt(false)
      setCountdown(AUTO_LOGOUT_SECS)
      logoutCalledRef.current = false

      if (!fbUser) return

      const rawToken = await fbUser.getIdToken()
      const expMs = getTokenExpMs(rawToken)
      if (!expMs) return

      const delay = expMs - WARN_BEFORE_MS - Date.now()

      if (delay <= 0) {
        // Already inside the warning window
        setShowPrompt(true)
      } else {
        warnTimerRef.current = setTimeout(() => {
          setShowPrompt(true)
        }, delay)
      }
    })

    return () => {
      unsub()
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current)
    }
  }, [])

  // ── Stay logged in ────────────────────────────────────────────────────────

  const stayLoggedIn = useCallback(async () => {
    setShowPrompt(false)
    // Force-refresh the token → fires onIdTokenChanged → resets the warn timer
    await auth.currentUser?.getIdToken(true)
  }, [])

  return { showPrompt, countdown, stayLoggedIn, logOut }
}
