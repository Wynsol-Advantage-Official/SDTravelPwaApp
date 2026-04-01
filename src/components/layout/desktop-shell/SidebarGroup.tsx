"use client"

import Link from "next/link"
import {
  Home,
  Map,
  Heart,
  Compass,
  Gem,
  MessageCircle,
  CalendarDays,
  Hotel,
  Building2,
  Car,
  type LucideIcon,
} from "lucide-react"
import { isNavItemActive } from "@/lib/rules/navigation-rules"
import type { NavGroup, NavIconName } from "@/types/navigation"

/** Maps NavIconName strings to Lucide icon components. */
const ICON_MAP: Record<NavIconName, LucideIcon> = {
  home: Home,
  map: Map,
  heart: Heart,
  compass: Compass,
  gem: Gem,
  "message-circle": MessageCircle,
  "calendar-days": CalendarDays,
  hotel: Hotel,
  building: Building2,
  car: Car,
}

interface SidebarGroupProps {
  group: NavGroup
  collapsed: boolean
  pathname: string
}

export function SidebarGroup({ group, collapsed, pathname }: SidebarGroupProps) {
  return (
    <div className="mb-4">
      {/* Group label — hidden when collapsed */}
      {!collapsed && (
        <p className="mb-2 px-3 font-sans text-[9px] uppercase tracking-[0.14em] text-ocean/60 dark:text-blue-chill-300">
          {group.label}
        </p>
      )}

      <ul className="flex flex-col gap-0.5">
        {group.items.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const active = isNavItemActive(item, pathname)

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative flex items-center rounded-[var(--card-radius-compact)] font-sans transition-[background-color,color] duration-[220ms] ease-out",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-chill",
                  "motion-reduce:transition-none",
                  collapsed
                    ? "mx-auto h-11 w-11 justify-center"
                    : "gap-3 px-3 py-[0.6rem]",
                  active
                    ? "border border-ocean/15 bg-ocean/8 text-ocean-deep dark:border-[rgba(18,130,165,0.18)] dark:bg-blue-chill/10 dark:text-blue-chill-300"
                    : "border border-transparent text-ocean-deep/50 hover:bg-tan/60 hover:text-ocean-deep dark:text-white/60 dark:hover:bg-[rgba(255,255,255,0.03)] dark:hover:text-white",
                ]
                  .join(" ")}
              >
                <Icon size={18} className="shrink-0" aria-hidden="true" />

                {!collapsed && (
                  <span className="text-[13px] font-medium">{item.label}</span>
                )}

                {/* Tooltip — visible on hover/focus only in collapsed mode */}
                {collapsed && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-[var(--card-radius-compact)] border border-khaki/40 bg-white px-3 py-1.5 text-[13px] text-ocean-deep shadow-md group-hover:block group-focus-visible:block dark:border-transparent dark:bg-ocean-card dark:text-white dark:shadow-lg"
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
