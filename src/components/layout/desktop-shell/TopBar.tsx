"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Plus, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { DISCOVER_GROUP, isNavItemActive } from "@/lib/rules/navigation-rules"
import type { NavItem } from "@/types/navigation"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

const SEARCH_ITEMS = [
  { label: "Home", href: "/", category: "Pages" },
  { label: "Destinations", href: "/destinations", category: "Pages" },
  { label: "Tours", href: "/tours", category: "Pages" },
  { label: "Hotels", href: "/rooms?type=hotel", category: "Services" },
  { label: "Airbnbs", href: "/rooms?type=airbnb", category: "Services" },
  { label: "Taxi", href: "/rooms?type=taxi", category: "Services" },
  { label: "My Bookings", href: "/dashboard/bookings", category: "Dashboard" },
  { label: "Saved Diamonds", href: "/dashboard/saved", category: "Dashboard" },
  { label: "Concierge Chat", href: "/dashboard/chat", category: "Dashboard" },
  { label: "Profile", href: "/dashboard/profile", category: "Dashboard" },
] as const

// Primary nav items — DISCOVER_GROUP without the "Saved" item
const NAV_ITEMS = DISCOVER_GROUP.items.filter((item) => item.id !== "saved")

function getInitials(name: string | null | undefined): string {
  if (!name) return "T"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

/** Authenticated user avatar + dropdown menu. */
function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (loading) return null

  if (!user) {
    return (
      <Link
        href="/auth/sign-in"
        className="inline-flex items-center gap-1.5 rounded-full border border-khaki/40 px-3 py-1.5 font-sans text-xs font-semibold text-ocean-deep transition-colors hover:bg-tan/30 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign In
      </Link>
    )
  }

  const displayName = user.displayName ?? "Traveler"
  const initials = getInitials(user.displayName ?? user.email)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="User menu"
        className="flex items-center gap-1.5 rounded-full border border-khaki/30 py-1 pl-1.5 pr-2.5 transition-colors hover:bg-tan/20 dark:border-white/10 dark:hover:bg-white/5"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-chill font-sans text-[10px] font-bold text-white">
          {initials}
        </span>
        <span className="max-w-24 truncate font-sans text-xs font-medium text-ocean-deep dark:text-white">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-ocean-deep/50 transition-transform dark:text-white/50 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-95" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-96 mt-2 w-52 overflow-hidden rounded-xl border border-khaki/30 bg-white shadow-lg dark:border-white/10 dark:bg-ocean-deep">
            <div className="border-b border-khaki/20 px-4 py-3 dark:border-white/10">
              <p className="font-sans text-sm font-semibold text-ocean-deep dark:text-white">
                {displayName}
              </p>
              <p className="font-sans text-xs text-ocean/60 dark:text-blue-chill-300">
                Diamond Member
              </p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-medium text-ocean-deep transition-colors hover:bg-tan/30 dark:text-white dark:hover:bg-white/5"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <button
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 font-sans text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/** Nav item with child flyout (used for Rooms → Hotels / Airbnbs). */
function DropdownNavItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive =
    item.children?.some((c) => isNavItemActive(c, pathname)) ||
    isNavItemActive(item, pathname)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1 rounded-md px-3 py-1.5 font-sans text-sm font-medium transition-colors ${
          isActive
            ? "text-ocean-deep dark:text-white"
            : "text-ocean-deep/60 hover:text-ocean-deep dark:text-white/60 dark:hover:text-white"
        }`}
      >
        {item.label}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        />
        {isActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-ocean" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-95" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-96 mt-1 w-36 overflow-hidden rounded-xl border border-khaki/30 bg-white shadow-lg dark:border-white/10 dark:bg-ocean-deep">
            {item.children?.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 font-sans text-xs font-medium transition-colors hover:bg-tan/30 dark:hover:bg-white/5 ${
                  isNavItemActive(child, pathname)
                    ? "text-ocean-deep dark:text-white"
                    : "text-ocean-deep/70 dark:text-white/70"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function TopBar() {
  const router = useRouter()
  const pathname = usePathname() ?? "/"

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.length > 0
    ? SEARCH_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const showDropdown = open && query.length > 0 && filtered.length > 0

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const closeAndNavigate = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery("")
      router.push(href)
    },
    [router]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filtered.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
        break
      case "Enter":
        e.preventDefault()
        if (filtered[selectedIndex]) {
          closeAndNavigate(filtered[selectedIndex].href)
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  // Group filtered results by category
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
    const cat = item.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  // Flat index counter for keyboard nav
  let flatIndex = -1

  return (
    <header
      className="sticky top-0 z-90 flex h-14 items-center gap-4 border-b border-khaki/50 bg-white px-5 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-ocean-deep/92"
    >
      {/* Logo */}
      <Link href="/" aria-label="Sand Diamonds — Home" className="shrink-0 transition-opacity hover:opacity-80">
        <Image
          src="/logos/brand/full_colour.svg"
          alt="Sand Diamonds Travel"
          width={110}
          height={32}
          className="h-8 w-auto"
          priority
        />
      </Link>

      {/* Divider */}
      <div className="h-5 w-px shrink-0 bg-khaki/40 dark:bg-white/10" aria-hidden="true" />

      {/* Primary navigation */}
      <nav aria-label="Primary navigation" className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) =>
          item.children ? (
            <DropdownNavItem key={item.id} item={item} pathname={pathname} />
          ) : (
            <Link
              key={item.id}
              href={item.href}
              className={`relative rounded-md px-3 py-1.5 font-sans text-sm font-medium transition-colors ${
                isNavItemActive(item, pathname)
                  ? "text-ocean-deep dark:text-white"
                  : "text-ocean-deep/60 hover:text-ocean-deep dark:text-white/60 dark:hover:text-white"
              }`}
            >
              {item.label}
              {isNavItemActive(item, pathname) && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-ocean" />
              )}
            </Link>
          ),
        )}
      </nav>

      {/* Spacer pushes right-side controls to edge */}
      <div className="flex-1" />

      {/* Right: search + CTA + user + theme */}
      <div className="flex items-center gap-3">
        {/* Search input + dropdown */}
        <div className="relative" ref={containerRef}>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-400 dark:text-blue-chill-300"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search journeys, destinations..."
            aria-label="Search journeys, destinations, or bookings"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? "search-listbox" : undefined}
            aria-activedescendant={
              showDropdown ? `search-option-${selectedIndex}` : undefined
            }
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
              // Close dropdown when focus leaves the search container
              if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                setOpen(false)
              }
            }}
            onKeyDown={handleKeyDown}
            className="h-8.5 w-60 rounded-(--card-radius-compact) border border-ocean/15 bg-white pl-8 pr-3 font-sans text-[13px] text-ocean-deep placeholder:text-ocean-400 focus:border-blue-chill focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-chill/20 dark:border-luxborder dark:bg-ocean-card dark:text-white dark:placeholder:text-blue-chill-300"
          />

          {/* Dropdown panel */}
          {showDropdown && (
            <div
              id="search-listbox"
              role="listbox"
              aria-label="Search results"
              className="absolute left-0 top-full z-50 mt-1 max-h-80 w-70 overflow-y-auto rounded-(--card-radius-compact) border border-ocean/15 bg-white shadow-lg dark:border-luxborder dark:bg-ocean-card"
            >
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="px-3 pb-1 pt-2.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-ocean-400 dark:text-blue-chill-300">
                    {category}
                  </p>
                  {items.map((item) => {
                    flatIndex++
                    const idx = flatIndex
                    return (
                      <Link
                        key={item.href}
                        id={`search-option-${idx}`}
                        href={item.href}
                        role="option"
                        aria-selected={selectedIndex === idx}
                        onClick={() => {
                          setOpen(false)
                          setQuery("")
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`block px-3 py-1.5 font-sans text-[13px] transition-colors ${
                          selectedIndex === idx
                            ? "bg-blue-chill/10 text-blue-chill dark:bg-blue-chill/10 dark:text-blue-chill-300"
                            : "text-ocean-deep hover:bg-ocean/5 dark:text-white dark:hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan a Trip CTA */}
        <Link
          href="/tours"
          className="inline-flex h-8.5 items-center gap-1.5 rounded-(--card-radius-compact) bg-ocean px-3.5 font-sans text-[12px] font-semibold text-white transition-[transform,background-color] duration-220 ease-out hover:-translate-y-px hover:bg-blue-chill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-chill motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
        >
          <Plus size={14} aria-hidden="true" />
          Plan a Trip
        </Link>

        {/* User menu */}
        <UserMenu />

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}

