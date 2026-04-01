"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gem } from "lucide-react"
import { SIDEBAR_NAV_GROUPS } from "@/lib/rules/navigation-rules"
import { SidebarGroup } from "./SidebarGroup"
import { SidebarUserCard } from "./SidebarUserCard"

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname() ?? "/"

  return (
    <aside
      className="fixed inset-y-0 left-0 z-[100] flex flex-col border-r border-luxborder bg-luxury-card3"
      style={{ width: collapsed ? 64 : 220 }}
    >
      {/* Logo zone */}
      <Link
        href="/"
        className={`flex shrink-0 items-center gap-2 transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxgold ${
          collapsed
            ? "justify-center px-2 pb-5 pt-7"
            : "px-6 pb-5 pt-7"
        }`}
        aria-label="Sand Diamonds — Home"
      >
        <Gem size={20} className="shrink-0 text-luxgold" aria-hidden="true" />
        {!collapsed && (
          <span className="font-serif text-xl tracking-tight text-luxtext">
            Sand&nbsp;<span className="text-luxgold">Diamonds</span>
          </span>
        )}
      </Link>

      {/* Navigation groups */}
      <nav
        className="flex-1 overflow-y-auto px-2 scrollbar-hide"
        aria-label="Main navigation"
      >
        {SIDEBAR_NAV_GROUPS.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* User card */}
      <SidebarUserCard collapsed={collapsed} />
    </aside>
  )
}
