"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BRAND } from "@/lib/config/brand"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"

export default function SignInPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle, user, loading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [loading, user, router])

  if (!loading && user) {
    return null
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again."
      if (message.includes("user-not-found") || message.includes("wrong-password") || message.includes("invalid-credential")) {
        setError("Invalid email or password.")
      } else if (message.includes("too-many-requests")) {
        setError("Too many attempts. Please try again later.")
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setSubmitting(true)

    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed."
      if (message.includes("popup-closed-by-user")) {
        // User closed the popup, no error to show
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Brand */}
      <div className="text-center">
        <Link href="/" className="inline-block">
          <span className="font-sans text-3xl font-bold text-ocean">
            {BRAND.name}
          </span>
        </Link>
        <p className="mt-2 text-sm text-ocean-deep/50 dark:text-white/50">
          Sign in to your travel dashboard
        </p>
      </div>

      {/* Card */}
      <div className="rounded-sm border border-khaki/20 bg-white p-8 backdrop-blur-sm dark:border-ocean/10 dark:bg-white/5">
        {/* Google SSO */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-sm border border-white/20 bg-white px-4 py-3 text-sm font-medium text-ocean-deep transition-colors hover:bg-white disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ocean/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-ocean-deep/40 dark:bg-ocean-deep dark:text-white/30">
              or sign in with email
            </span>
          </div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-ocean-deep/50 dark:text-white/50"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-12 w-full rounded-sm border border-khaki/30 bg-white px-4 text-sm text-ocean-deep placeholder:text-ocean-deep/30 dark:border-ocean/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 focus:border-ocean focus:ring-1 focus:ring-ocean"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-ocean-deep/50 dark:text-white/50"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              minLength={6}
              className="h-12 w-full rounded-sm border border-khaki/30 bg-white px-4 text-sm text-ocean-deep placeholder:text-ocean-deep/30 dark:border-ocean/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 focus:border-ocean focus:ring-1 focus:ring-ocean"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>

      {/* Footer links */}
      <p className="text-center text-sm text-ocean-deep/50 dark:text-white/50">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-medium text-ocean transition-colors hover:text-blue-chill/80"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
