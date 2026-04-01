"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMockMode } from "@/hooks/useMockMode"
import { useAuth } from "@/hooks/useAuth"

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Overview", icon: "◆" },
  { href: "/dashboard/bookings", label: "My Bookings", icon: "◈" },
  { href: "/dashboard/saved", label: "Saved Diamonds", icon: "♦" },
  { href: "/dashboard/chat", label: "Concierge Chat", icon: "◇" },
  { href: "/dashboard/concierge", label: "Concierge Admin", icon: "⧫" },
  { href: "/dashboard/profile", label: "Profile", icon: "●" },
] as const

export function DashboardNav() {
  const pathname = usePathname()
  const { isMockMode, toggleMockMode } = useMockMode()
  const { isAdmin } = useAuth()

  const LINKS = DASHBOARD_LINKS.filter((l) => {
    // Hide Concierge Admin unless user has admin claim
    if (l.href === "/dashboard/concierge") return Boolean(isAdmin)
    return true
  })

  return (
    <nav className="sticky top-0 z-50 border-b border-luxborder bg-luxury-card3 md:top-14" aria-label="Dashboard">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {LINKS.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-luxgold text-luxgold"
                    : "border-transparent text-luxtext-muted hover:text-luxtext",
                ].join(" ")}
              >
                <span className="text-xs">{icon}</span>
                {label}
              </Link>
            )
          })}
        </div>

        {/* Mock mode toggle — dev helper */}
        <button
          type="button"
          onClick={toggleMockMode}
          className={[
            "shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
            isMockMode
              ? "bg-luxgold-dim text-luxgold"
              : "bg-luxury-card text-luxtext-subtle hover:text-luxtext-muted",
          ].join(" ")}
          title={isMockMode ? "Using mock data" : "Using live data"}
        >
          {isMockMode ? "Mock" : "Live"}
        </button>
      </div>
    </nav>
  )
}
