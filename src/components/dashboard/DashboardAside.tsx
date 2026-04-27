"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Map,
  Gem,
  MessageCircle,
  CalendarDays,
  Hotel,
  Building2,
  Car,
  Shield,
  Users,
  Settings,
  BarChart3,
  LayoutDashboard,
  User,
  Headphones,
  type LucideIcon,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import {
  getDashboardNavGroupsForRole,
  isNavItemActive,
} from "@/lib/rules/navigation-rules"
import type { NavGroup, NavItem, NavIconName } from "@/types/navigation"

// ---------------------------------------------------------------------------
// Icon map — same set as SidebarGroup
// ---------------------------------------------------------------------------
const ICON_MAP: Record<NavIconName, LucideIcon> = {
  home: Home,
  map: Map,
  heart: Gem,
  compass: Shield,
  gem: Gem,
  "message-circle": MessageCircle,
  "calendar-days": CalendarDays,
  hotel: Hotel,
  building: Building2,
  car: Car,
  shield: Shield,
  users: Users,
  settings: Settings,
  "bar-chart": BarChart3,
  "layout-dashboard": LayoutDashboard,
  user: User,
  headphones: Headphones,
}

// ---------------------------------------------------------------------------
// DashboardAside — portal nav for all auth users + admin sections by role
// ---------------------------------------------------------------------------
export function DashboardAside({
  mode = "desktop",
}: {
  mode?: "desktop" | "drawer"
}) {
  const { user, role } = useAuth()
  const pathname = usePathname() ?? "/"
  const { isMockMode, toggleMockMode } = useMockMode()

  // Not authenticated — render nothing
  if (!user) return null

  const groups = getDashboardNavGroupsForRole(role)

  return (
    <aside
      aria-label="Dashboard navigation"
      className={
        mode === "drawer"
          ? "block h-full min-h-0 w-full overflow-y-auto"
          : "hidden h-full min-h-0 w-52 shrink-0 overflow-y-auto lg:block"
      }
    >
      <nav className=" bg-white shadow-sm dark:border-tan-100/10 dark:bg-ocean-card">
        {groups.map((group) => (
          <AsideGroup key={group.id} group={group} pathname={pathname} />
        ))}

        {/* Mock / Live toggle — preserved from DashboardNav */}
        <div className="border-t border-ocean-deep/5 px-3 py-2 dark:border-tan-100/5">
          <button
            type="button"
            onClick={toggleMockMode}
            className={[
              "w-full rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
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
    </aside>
  )
}

// ---------------------------------------------------------------------------
// AsideGroup
// ---------------------------------------------------------------------------
function AsideGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  return (
    <div className="p-3">
      <p className="mb-1.5 px-2 font-sans text-[9px] uppercase tracking-[0.14em] text-ocean/60 dark:text-blue-chill/70">
        {group.label}
      </p>
      <ul className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <AsideItem key={item.id} item={item} pathname={pathname} />
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AsideItem
// ---------------------------------------------------------------------------
function AsideItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavItemActive(item, pathname)
  const Icon = ICON_MAP[item.icon]

  return (
    <li>
      <Link
        href={item.href}
        className={[
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
          active
            ? "bg-ocean/8 text-ocean-deep dark:bg-blue-chill/10 dark:text-blue-chill-300"
            : "text-ocean-deep/55 hover:bg-tan/60 hover:text-ocean-deep dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white",
        ].join(" ")}
      >
        {Icon && (
          <Icon
            className={`h-3.5 w-3.5 shrink-0 ${active ? "text-ocean dark:text-blue-chill" : "text-ocean-deep/40 dark:text-white/35"}`}
          />
        )}
        {item.label}
      </Link>
    </li>
  )
}
