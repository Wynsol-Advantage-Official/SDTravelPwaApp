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
    <nav className="border-b border-khaki/30 bg-white dark:border-white/10 dark:bg-ocean-deep md:top-14" aria-label="Dashboard">
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
                    ? "border-ocean text-ocean dark:border-blue-chill dark:text-blue-chill"
                    : "border-transparent text-ocean-deep/50 hover:text-ocean-deep dark:text-white/60 dark:hover:text-white",
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
              ? "bg-blue-chill/10 text-blue-chill"
              : "bg-tan-50 text-ocean-deep/50 hover:text-ocean-deep/70 dark:bg-ocean-card dark:text-white/40 dark:hover:text-white/60",
          ].join(" ")}
          title={isMockMode ? "Using mock data" : "Using live data"}
        >
          {isMockMode ? "Mock" : "Live"}
        </button>
      </div>
    </nav>
  )
}
