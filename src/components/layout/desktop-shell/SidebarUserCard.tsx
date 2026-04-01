"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

interface SidebarUserCardProps {
  collapsed: boolean
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "T"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const { user, loading } = useAuth()

  if (loading || !user) return null

  const displayName = user.displayName ?? "Traveler"
  const initials = getInitials(user.displayName ?? user.email)

  return (
    <Link
      href="/dashboard"
      className="block border-t border-luxborder p-3 cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.03)]"
    >
      <div
        className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? displayName : undefined}
      >
        {/* Initials avatar */}
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-luxgold text-[11px] font-bold text-luxury-base"
          aria-hidden="true"
        >
          {initials}
        </span>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-[13px] font-medium text-luxtext">
              {displayName}
            </p>
            <p className="font-sans text-[11px] text-luxtext-muted">
              Diamond Member
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
