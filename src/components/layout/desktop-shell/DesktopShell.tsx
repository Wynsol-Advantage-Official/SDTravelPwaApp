"use client"

import { type ReactNode } from "react"
import { TopBar } from "./TopBar"

interface DesktopShellProps {
  children: ReactNode
}

/**
 * Desktop-only application shell — fixed left sidebar + sticky top bar.
 * Hidden below 768px (mobile uses MobileNav / MobileBottomNav).
 */
export function DesktopShell({ children }: DesktopShellProps) {
  return (
    <div className="h-dvh overflow-hidden">
      {/* Content column — full viewport height, no sidebar offset */}
      <div className="flex h-dvh flex-col">
        {/* TopBar — in-flow, never scrolls */}
        <div className="hidden shrink-0 md:block">
          <TopBar />
        </div>

        {/* Scrollable main — fills remaining height; each page controls its own inner scroll */}
        <main className="w-full flex-1 overflow-auto bg-white pb-[calc(64px+env(safe-area-inset-bottom))] md:p-0 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
