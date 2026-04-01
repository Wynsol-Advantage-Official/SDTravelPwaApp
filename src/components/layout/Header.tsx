"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence } from "framer-motion"
import { MobileNav } from "./MobileNav"
import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

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
      <div className="border-b border-khaki/50 bg-white/90 backdrop-blur-md dark:border-blue-chill/10 dark:bg-ocean-deep/90">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logos/brand/full_colour.svg"
              alt="Sand Diamonds Travel"
              width={140}
              height={48}
              className="h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logos/brand/white_solid.svg"
              alt="Sand Diamonds Travel"
              width={140}
              height={48}
              className="hidden h-10 w-auto dark:block"
              priority
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm font-medium tracking-wide text-ocean-deep/80 transition-colors hover:text-blue-chill dark:text-white/80 dark:hover:text-blue-chill-300"
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
                  className="flex items-center gap-2 rounded-full border border-ocean/15 py-1 pl-1 pr-3 transition-colors hover:border-blue-chill dark:border-white/15 dark:hover:border-blue-chill"
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
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ocean text-xs font-bold text-white">
                      {(user.displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate text-xs font-medium text-ocean-deep/80 dark:text-white/80">
                    {user.displayName ?? "Traveler"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-xs font-medium text-ocean-deep/40 transition-colors hover:text-blue-chill dark:text-white/40 dark:hover:text-blue-chill-300"
                >
                  Sign Out
                </button>
              </div>
            ) : !loading ? (
              /* Signed-out: sign in + book */
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/auth/sign-in"
                  className="text-xs font-medium tracking-wide text-ocean-deep/80 transition-colors hover:text-blue-chill dark:text-white/80 dark:hover:text-blue-chill-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/tours"
                  className="rounded-sm bg-ocean px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-blue-chill"
                >
                  Book Now
                </Link>
              </div>
            ) : null}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-sm text-ocean-deep md:hidden dark:text-white"
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
