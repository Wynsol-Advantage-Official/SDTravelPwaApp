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
        <p className="mb-2 px-3 font-sans text-[9px] uppercase tracking-[0.14em] text-luxtext-subtle">
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
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxgold",
                  "motion-reduce:transition-none",
                  collapsed
                    ? "mx-auto h-11 w-11 justify-center"
                    : "gap-3 px-3 py-[0.6rem]",
                  active
                    ? "border border-[rgba(201,168,76,0.18)] bg-luxgold-dim text-luxgold-light"
                    : "border border-transparent text-luxtext-muted hover:bg-[rgba(255,255,255,0.03)] hover:text-luxtext",
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
                    className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-[var(--card-radius-compact)] bg-luxury-card2 px-3 py-1.5 text-[13px] text-luxtext shadow-lg group-hover:block group-focus-visible:block"
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
