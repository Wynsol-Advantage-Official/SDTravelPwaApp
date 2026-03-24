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

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser)
      setLoading(false)

      // populate admin custom claim (if present)
      if (fbUser) {
        fbUser
          .getIdTokenResult()
          .then((res) => setIsAdmin(Boolean(res.claims?.admin)))
          .catch(() => setIsAdmin(false))
      } else {
        setIsAdmin(false)
      }
    })
    return unsub
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
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
    [user, loading],
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
