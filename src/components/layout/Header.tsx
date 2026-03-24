"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence } from "framer-motion"
import { MobileNav } from "./MobileNav"
import { useAuth } from "@/hooks/useAuth"

const NAV_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "My Diamonds" },
  { href: "/dashboard/chat", label: "Concierge" },
] as const

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Backdrop blur bar */}
      <div className="border-b border-diamond/10 bg-charcoal/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-lg font-bold tracking-wide text-diamond transition-colors hover:text-gold"
          >
            Sand&nbsp;Diamonds
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm font-medium tracking-wide text-diamond/80 transition-colors hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth area + hamburger */}
          <div className="flex items-center gap-3">
            {!loading && user ? (
              /* Signed-in: avatar + sign out */
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-diamond/15 py-1 pl-1 pr-3 transition-colors hover:border-gold"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-charcoal">
                      {(user.displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate text-xs font-medium text-diamond/80">
                    {user.displayName ?? "Traveler"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-xs font-medium text-diamond/40 transition-colors hover:text-gold"
                >
                  Sign Out
                </button>
              </div>
            ) : !loading ? (
              /* Signed-out: sign in + book */
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/auth/sign-in"
                  className="text-xs font-medium tracking-wide text-diamond/80 transition-colors hover:text-gold"
                >
                  Sign In
                </Link>
                <Link
                  href="/tours"
                  className="rounded-sm bg-gold px-5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:bg-gold-400"
                >
                  Book Now
                </Link>
              </div>
            ) : null}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-sm text-diamond md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileNav links={NAV_LINKS} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
    </header>
  )
}
