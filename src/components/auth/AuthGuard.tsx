"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import type { UserRole } from "@/types/tenant"

const ROLE_RANK: Record<string, number> = {
  user: 1,
  tenant_admin: 2,
  super_admin: 3,
}

interface AuthGuardProps {
  children: React.ReactNode
  fallbackMessage?: string
  /** Minimum role required. Omit for any authenticated user. */
  requiredRole?: UserRole
}

/**
 * Protects client-side routes — shows a sign-in prompt if unauthenticated.
 * Wrap dashboard pages with this to enforce login.
 */
export function AuthGuard({ children, fallbackMessage, requiredRole }: AuthGuardProps) {
  const { user, loading, role } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
          <p className="text-sm text-ocean-deep/50">Loading your account…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-4xl text-ocean">◆</div>
          <h2 className="font-sans text-2xl font-bold text-ocean-deep">
            Sign In Required
          </h2>
          <p className="mt-2 text-sm text-ocean-deep/60">
            {fallbackMessage ??
              "Sign in to access your travel dashboard, bookings, and concierge chat."}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/sign-in"
              className="inline-flex h-12 items-center rounded-sm bg-ocean px-8 text-sm font-semibold uppercase tracking-wider text-ocean-deep transition-colors hover:bg-blue-chill"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex h-12 items-center rounded-sm border border-ocean-deep/20 px-8 text-sm font-semibold uppercase tracking-wider text-ocean-deep transition-colors hover:border-blue-chill hover:text-blue-chill"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Role check ──────────────────────────────────────────────────────────
  if (requiredRole) {
    const userRank = ROLE_RANK[role ?? "user"] ?? 1
    const requiredRank = ROLE_RANK[requiredRole] ?? 999
    if (userRank < requiredRank) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="max-w-sm text-center">
            <div className="mb-4 text-4xl text-ocean">◆</div>
            <h2 className="font-sans text-2xl font-bold text-ocean-deep">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-ocean-deep/60">
              You do not have permission to view this page.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-12 items-center rounded-sm bg-ocean px-8 text-sm font-semibold uppercase tracking-wider text-ocean-deep transition-colors hover:bg-blue-chill"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
