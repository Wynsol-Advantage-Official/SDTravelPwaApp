"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { ensureProfile } from "@/lib/firebase/auth"
import type { UserRole } from "@/types/tenant"

interface AuthContextValue {
  user: User | null
  loading: boolean
  /** @deprecated Use `role` instead. Kept for backward compatibility. */
  isAdmin: boolean
  role: UserRole
  tenantId: string | null
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** POST/DELETE the Firebase ID token to the session cookie endpoint. */
async function syncSessionCookie(user: User | null): Promise<void> {
  try {
    if (user) {
      const idToken = await user.getIdToken()
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })
    } else {
      await fetch("/api/auth/session", { method: "DELETE" })
    }
  } catch {
    // Best-effort — middleware falls back gracefully
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState<UserRole>("user")
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser)
      setLoading(false)

      if (fbUser) {
        fbUser
          .getIdTokenResult()
          .then((res) => {
            const claims = res.claims
            // New multi-tenant claims
            const userRole = (claims.role as UserRole) ?? "user"
            setRole(userRole)
            setTenantId((claims.tenantId as string) ?? null)
            // Backward compat: admin = super_admin OR tenant_admin OR legacy admin flag
            setIsAdmin(
              userRole === "super_admin" ||
              userRole === "tenant_admin" ||
              Boolean(claims.admin),
            )
          })
          .catch(() => {
            setIsAdmin(false)
            setRole("user")
            setTenantId(null)
          })

        // Set the cross-subdomain session cookie (SOW §4.1)
        syncSessionCookie(fbUser)

        // Fire-and-forget: create profile if missing
        ensureProfile(fbUser).catch(() => {
          /* silent — best-effort */
        })
      } else {
        setIsAdmin(false)
        setRole("user")
        setTenantId(null)
        // Clear the session cookie on sign-out
        syncSessionCookie(null)
      }
    })
    return unsub
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      role,
      tenantId,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password)
      },
      signInWithGoogle: async () => {
        await signInWithPopup(auth, new GoogleAuthProvider())
      },
      signOut: async () => {
        await fbSignOut(auth)
      },
    }),
    [user, loading, role, tenantId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
