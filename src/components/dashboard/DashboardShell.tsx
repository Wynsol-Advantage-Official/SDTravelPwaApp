"use client"

import { useState } from "react"
import { X, Menu } from "lucide-react"
import { DashboardAside } from "@/components/dashboard/DashboardAside"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden">
      {/* Mobile toggle: visible < lg */}
      <div className="flex w-full items-center justify-between px-4 pb-3 pt-4 sm:px-6 lg:hidden">
        <button
          aria-expanded={open}
          aria-label={open ? "Close admin menu" : "Open admin menu"}
          onClick={() => setOpen((s) => !s)}
          className="inline-flex items-center gap-2 rounded-md border border-ocean-deep/10 bg-white px-3 py-2 text-sm font-medium text-ocean-deep shadow-sm"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="text-xs">Admin</span>
        </button>
      </div>

      {/* Drawer overlay for < lg */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="flex h-full w-72 shrink-0 flex-col overflow-hidden border-r border-ocean-deep/10 bg-white p-4 shadow-xl dark:bg-ocean-card"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-ocean-deep">Admin</div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close admin"
                className="rounded p-1.5 text-ocean-deep/60 hover:text-ocean-deep"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <DashboardAside mode="drawer" />
            </div>
          </div>
          <button
            aria-hidden
            className="flex-1 bg-black/30"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-6 overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6">
        {/* Aside — sticky on lg, overlay drawer on small screens */}
        <div className="hidden h-full min-h-0 w-52 shrink-0 overflow-y-auto lg:block">
          <DashboardAside />
        </div>
      {/* Main content */}
      <main className="h-112.5 min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
    </div >
  )
}
