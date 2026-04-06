"use client"

import { useState } from "react"
import { X, Menu } from "lucide-react"
import { DashboardAside } from "@/components/dashboard/DashboardAside"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-10 sm:px-6">
      {/* Mobile toggle: visible < lg */}
      <div className="flex w-full items-center justify-between lg:hidden">
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

      {/* Aside — sticky on lg, overlay drawer on small screens */}
      <DashboardAside />

      {/* Drawer overlay for < lg */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="w-72 shrink-0 overflow-auto border-r border-ocean-deep/10 bg-white p-4 shadow-xl dark:bg-ocean-card"
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
            <div className="overflow-auto">
              <DashboardAside />
            </div>
          </div>
          <button
            aria-hidden
            className="flex-1 bg-black/30"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
