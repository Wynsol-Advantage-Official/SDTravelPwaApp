"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

const SEARCH_ITEMS = [
  { label: "Home", href: "/", category: "Pages" },
  { label: "Destinations", href: "/destinations", category: "Pages" },
  { label: "Tours", href: "/tours", category: "Pages" },
  { label: "Hotels", href: "/accommodations?type=hotel", category: "Services" },
  { label: "Airbnbs", href: "/accommodations?type=airbnb", category: "Services" },
  { label: "Taxi", href: "/accommodations?type=taxi", category: "Services" },
  { label: "My Bookings", href: "/dashboard/bookings", category: "Dashboard" },
  { label: "Saved Diamonds", href: "/dashboard/saved", category: "Dashboard" },
  { label: "Concierge Chat", href: "/dashboard/chat", category: "Dashboard" },
  { label: "Profile", href: "/dashboard/profile", category: "Dashboard" },
] as const

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function TopBar() {
  const { user } = useAuth()
  const router = useRouter()
  const greeting = getGreeting()
  const name = user?.displayName ?? "Traveler"

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
      className="sticky top-0 z-[90] flex h-14 items-center justify-between border-b border-white/5 px-5 backdrop-blur-[12px]"
      style={{ backgroundColor: "rgba(13,13,13,0.92)" }}
    >
      {/* Left: greeting */}
      <p className="min-w-0 font-sans text-[16px] font-medium text-luxtext">
        <span className="font-serif italic">{greeting},</span>{" "}
        <span className="inline-block max-w-[200px] truncate align-bottom">
          {name}
        </span>
      </p>

      {/* Right: search + CTA */}
      <div className="flex items-center gap-3">
        {/* Search input + dropdown */}
        <div className="relative" ref={containerRef}>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-luxtext-subtle"
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
            className="h-[34px] w-[240px] rounded-[var(--card-radius-compact)] border border-luxborder bg-luxury-card2 pl-8 pr-3 font-sans text-[13px] text-luxtext placeholder:text-luxtext-subtle focus:border-luxborder-gold focus:outline-none focus:ring-1 focus:ring-inset focus:ring-luxgold/20"
          />

          {/* Dropdown panel */}
          {showDropdown && (
            <div
              id="search-listbox"
              role="listbox"
              aria-label="Search results"
              className="absolute left-0 top-full z-50 mt-1 max-h-[320px] w-[280px] overflow-y-auto rounded-[var(--card-radius-compact)] border border-luxborder bg-luxury-card shadow-lg"
            >
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="px-3 pb-1 pt-2.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-luxtext-subtle">
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
                            ? "bg-luxgold/10 text-luxgold"
                            : "text-luxtext hover:bg-white/5"
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
          className="inline-flex h-[34px] items-center gap-1.5 rounded-[var(--card-radius-compact)] bg-luxgold px-3.5 font-sans text-[12px] font-semibold text-luxury-base transition-[transform,background-color] duration-[220ms] ease-out hover:-translate-y-px hover:bg-luxgold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxgold motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
        >
          <Plus size={14} aria-hidden="true" />
          Plan a Trip
        </Link>
      </div>
    </header>
  )
}
