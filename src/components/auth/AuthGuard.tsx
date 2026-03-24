"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
  fallbackMessage?: string
}

/**
 * Protects client-side routes — shows a sign-in prompt if unauthenticated.
 * Wrap dashboard pages with this to enforce login.
 */
export function AuthGuard({ children, fallbackMessage }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-charcoal/50">Loading your account…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-4xl text-gold">◆</div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            Sign In Required
          </h2>
          <p className="mt-2 text-sm text-charcoal/60">
            {fallbackMessage ??
              "Sign in to access your travel dashboard, bookings, and concierge chat."}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/sign-in"
              className="inline-flex h-12 items-center rounded-sm bg-gold px-8 text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:bg-gold-400"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex h-12 items-center rounded-sm border border-charcoal/20 px-8 text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:border-gold hover:text-gold"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
