"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"

export function TenantModalOverlay({
  children,
  onClose,
  panelClassName = "max-w-md",
}: {
  children: ReactNode
  onClose: () => void
  panelClassName?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`relative w-full rounded-xl bg-white p-6 shadow-xl dark:bg-luxury-base ${panelClassName}`}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-ocean-deep/40 hover:text-ocean-deep dark:text-tan-100/40 dark:hover:text-tan-100"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
