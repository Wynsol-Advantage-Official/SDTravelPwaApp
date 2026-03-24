"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { signUp } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/Button"

export default function SignUpPage() {
  const router = useRouter()
  const { signInWithGoogle, user, loading } = useAuth()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setSubmitting(true)

    try {
      await signUp(email, password, displayName)
      router.push("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-up failed. Please try again."
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.")
      } else if (message.includes("weak-password")) {
        setError("Password is too weak. Use at least 6 characters.")
      } else if (message.includes("invalid-email")) {
        setError("Please enter a valid email address.")
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setSubmitting(true)

    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed."
      if (!message.includes("popup-closed-by-user")) {
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
          <span className="font-serif text-3xl font-bold text-gold">
            Sand Diamonds Travel
          </span>
        </Link>
        <p className="mt-2 text-sm text-diamond/50">
          Create your travel account
        </p>
      </div>

      {/* Card */}
      <div className="rounded-sm border border-diamond/10 bg-white/5 p-8 backdrop-blur-sm">
        {/* Google SSO */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-sm border border-diamond/20 bg-white px-4 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-diamond disabled:opacity-50"
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
            <div className="w-full border-t border-diamond/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-charcoal px-3 text-xs uppercase tracking-wider text-diamond/30">
              or create with email
            </span>
          </div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-diamond/50"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              className="h-12 w-full rounded-sm border border-diamond/15 bg-white/5 px-4 text-sm text-diamond placeholder:text-diamond/30 focus:border-gold focus:ring-1 focus:ring-gold"
              placeholder="Sophia Laurent"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-diamond/50"
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
              className="h-12 w-full rounded-sm border border-diamond/15 bg-white/5 px-4 text-sm text-diamond placeholder:text-diamond/30 focus:border-gold focus:ring-1 focus:ring-gold"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-diamond/50"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              className="h-12 w-full rounded-sm border border-diamond/15 bg-white/5 px-4 text-sm text-diamond placeholder:text-diamond/30 focus:border-gold focus:ring-1 focus:ring-gold"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-diamond/50"
            >
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              className="h-12 w-full rounded-sm border border-diamond/15 bg-white/5 px-4 text-sm text-diamond placeholder:text-diamond/30 focus:border-gold focus:ring-1 focus:ring-gold"
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
            {submitting ? "Creating Account…" : "Create Account"}
          </Button>
        </form>
      </div>

      {/* Footer links */}
      <p className="text-center text-sm text-diamond/40">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-medium text-gold transition-colors hover:text-gold/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
