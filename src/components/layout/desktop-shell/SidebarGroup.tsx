"use client"

import { useState, useEffect } from "react"
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
  ChevronRight,
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

const itemClasses = (active: boolean, collapsed: boolean) =>
  [
    "group relative flex items-center rounded-[var(--card-radius-compact)] font-sans transition-[background-color,color] duration-[220ms] ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-chill",
    "motion-reduce:transition-none",
    collapsed ? "mx-auto h-11 w-11 justify-center" : "gap-3 px-3 py-[0.6rem]",
    active
      ? "border border-ocean/15 bg-ocean/8 text-ocean-deep dark:border-[rgba(18,130,165,0.18)] dark:bg-blue-chill/10 dark:text-blue-chill-300"
      : "border border-transparent text-ocean-deep/50 hover:bg-tan/60 hover:text-ocean-deep dark:text-white/60 dark:hover:bg-[rgba(255,255,255,0.03)] dark:hover:text-white",
  ].join(" ")

const tooltip = (label: string) => (
  <span
    role="tooltip"
    className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-[var(--card-radius-compact)] border border-khaki/40 bg-white px-3 py-1.5 text-[13px] text-ocean-deep shadow-md group-hover:block group-focus-visible:block dark:border-transparent dark:bg-ocean-card dark:text-white dark:shadow-lg"
  >
    {label}
  </span>
)

interface SidebarGroupProps {
  group: NavGroup
  collapsed: boolean
  pathname: string
}

export function SidebarGroup({ group, collapsed, pathname }: SidebarGroupProps) {
  // Track which parent items (with children) are expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const item of group.items) {
      if (item.children?.some((child) => isNavItemActive(child, pathname))) {
        initial.add(item.id)
      }
    }
    return initial
  })

  // Auto-expand parent when navigating to a child page
  useEffect(() => {
    const toExpand: string[] = []
    for (const item of group.items) {
      if (item.children?.some((child) => isNavItemActive(child, pathname))) {
        toExpand.push(item.id)
      }
    }
    if (toExpand.length > 0) {
      setExpanded((prev) => {
        const next = new Set(prev)
        toExpand.forEach((id) => next.add(id))
        return next
      })
    }
  }, [pathname, group.items])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
          const hasChildren = Boolean(item.children?.length)
          const active = isNavItemActive(item, pathname)
          const isExpanded = expanded.has(item.id)

          return (
            <li key={item.id}>
              {hasChildren ? (
                <>
                  {collapsed ? (
                    // Collapsed: act as a direct link to the default child
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={itemClasses(active, true)}
                    >
                      <Icon size={18} className="shrink-0" aria-hidden="true" />
                      {tooltip(item.label)}
                    </Link>
                  ) : (
                    // Expanded sidebar: toggle button
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      aria-expanded={isExpanded}
                      className={[itemClasses(active, false), "w-full"].join(" ")}
                    >
                      <Icon size={18} className="shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left text-[13px] font-medium">{item.label}</span>
                      <ChevronRight
                        size={14}
                        className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  {/* Sub-items — only visible when sidebar is expanded and parent is toggled open */}
                  {!collapsed && isExpanded && (
                    <ul className="mt-1 flex flex-col gap-0.5 border-l border-khaki/30 pl-4 ml-[26px] dark:border-white/10">
                      {item.children!.map((child) => {
                        const ChildIcon = ICON_MAP[child.icon]
                        const childActive = isNavItemActive(child, pathname)

                        return (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              aria-current={childActive ? "page" : undefined}
                              className={[
                                "group flex items-center gap-2 rounded-[var(--card-radius-compact)] py-1.5 pl-2 pr-3 font-sans text-[12px] font-medium transition-[background-color,color] duration-[220ms] ease-out",
                                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-chill",
                                childActive
                                  ? "text-ocean dark:text-blue-chill-300"
                                  : "text-ocean-deep/50 hover:text-ocean-deep dark:text-white/50 dark:hover:text-white",
                              ].join(" ")}
                            >
                              <ChildIcon size={14} className="shrink-0" aria-hidden="true" />
                              {child.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </>
              ) : (
                // Regular flat nav item
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={itemClasses(active, collapsed)}
                >
                  <Icon size={18} className="shrink-0" aria-hidden="true" />

                  {!collapsed && (
                    <span className="text-[13px] font-medium">{item.label}</span>
                  )}

                  {collapsed && tooltip(item.label)}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
