// ---------------------------------------------------------------------------
// Session Cookie Verification — Server-only
// ---------------------------------------------------------------------------
// Lightweight session token verification for use in Edge Middleware and
// API routes. The session cookie is a Firebase ID token issued by
// POST /api/auth/session after client-side Firebase Auth succeeds.
//
// In Edge Middleware we cannot use the full Firebase Admin SDK (it requires
// Node.js APIs). Instead, we decode the JWT header to extract claims without
// full cryptographic verification. Full verification happens in API routes
// via adminAuth.verifyIdToken().
// ---------------------------------------------------------------------------

import type { UserRole } from "@/types/tenant"

export interface SessionPayload {
  uid: string
  role: UserRole
  tenantId: string | null
}

/**
 * Decode the session cookie JWT to extract role & tenantId claims.
 *
 * This performs a lightweight base64 decode of the JWT payload — it does NOT
 * cryptographically verify the signature. This is acceptable at the Edge
 * Middleware layer because:
 *  1. The cookie is httpOnly + secure — it cannot be forged from JavaScript.
 *  2. Full verification happens in API routes before any data mutation.
 *  3. Firestore security rules are the ultimate enforcement layer.
 *
 * For API routes that need full verification, use `adminAuth.verifyIdToken()`.
 */
export function decodeSessionCookie(cookie: string): SessionPayload | null {
  try {
    const parts = cookie.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    )

    return {
      uid: payload.user_id ?? payload.uid ?? payload.sub ?? "",
      role: payload.role ?? "user",
      tenantId: payload.tenantId ?? null,
    }
  } catch {
    return null
  }
}
