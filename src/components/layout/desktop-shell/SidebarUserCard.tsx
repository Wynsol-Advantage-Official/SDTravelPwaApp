"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { LogIn, LogOut } from "lucide-react"

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
  const { user, loading, signOut } = useAuth()

  if (loading) return null

  // ---------- Unauthenticated ----------
  if (!user) {
    return (
      <Link
        href="/auth/sign-in"
        className="block border-t border-khaki/40 p-3 cursor-pointer transition-colors duration-200 hover:bg-tan/40 dark:border-white/10 dark:hover:bg-[rgba(255,255,255,0.05)]"
      >
        <div
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign In" : undefined}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/20 text-ocean dark:bg-blue-chill/20 dark:text-blue-chill">
            <LogIn className="h-3.5 w-3.5" />
          </span>
          {!collapsed && (
            <span className="font-sans text-[13px] font-medium text-ocean-deep dark:text-white">
              Sign In
            </span>
          )}
        </div>
      </Link>
    )
  }

  // ---------- Authenticated ----------
  const displayName = user.displayName ?? "Traveler"
  const initials = getInitials(user.displayName ?? user.email)

  return (
    <div className="border-t border-khaki/40 dark:border-white/10">
      <Link
        href="/dashboard"
        className="block p-3 cursor-pointer transition-colors duration-200 hover:bg-tan/40 dark:hover:bg-[rgba(255,255,255,0.05)]"
      >
        <div
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? displayName : undefined}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-chill text-[11px] font-bold text-white"
            aria-hidden="true"
          >
            {initials}
          </span>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-[13px] font-medium text-ocean-deep dark:text-white">
                {displayName}
              </p>
              <p className="font-sans text-[11px] text-ocean/70 dark:text-blue-chill-300">
                Diamond Member
              </p>
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={() => signOut()}
        className={`flex w-full items-center gap-3 px-3 pb-3 pt-0 text-[12px] font-medium text-ocean-deep/50 transition-colors hover:text-red-500 dark:text-tan-100/40 dark:hover:text-red-400 ${
          collapsed ? "justify-center" : ""
        }`}
        title={collapsed ? "Sign Out" : undefined}
      >
        <LogOut className="h-3.5 w-3.5" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </div>
  )
}
