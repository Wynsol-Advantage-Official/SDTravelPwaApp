"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

const COLLAPSE_QUERY = "(max-width: 1100px)"

interface DesktopShellProps {
  children: ReactNode
}

/**
 * Desktop-only application shell — fixed left sidebar + sticky top bar.
 * Hidden below 768px (mobile uses MobileNav / MobileBottomNav).
 */
export function DesktopShell({ children }: DesktopShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(COLLAPSE_QUERY)
    setCollapsed(mql.matches)
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  const sidebarWidth = collapsed ? 64 : 220

  return (
    <div
      className="min-h-dvh"
      style={
        { "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties
      }
    >
      {/* Sidebar — fixed full-height, desktop only */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Content column — offset on desktop for sidebar */}
      <div
        className="relative flex min-h-dvh flex-col md:ml-[var(--sidebar-width)]"
      >
        {/* TopBar — desktop only */}
        <div
          className="hidden fixed top-0 z-20 md:block"
          style={{ left: "var(--sidebar-width)", width: "calc(100% - var(--sidebar-width))" } as React.CSSProperties}
        >
          <TopBar />
        </div>
        <main className="absolute bg-white z-18 top-20 overflow-auto w-full flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] md:p-8 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
