"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface SaveConfirmModalProps {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function SaveConfirmModal({
  open,
  title = "Remove saved Diamond",
  description = "Are you sure you want to remove this tour from your saved Diamonds?",
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: SaveConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (open) {
      // trap focus to cancel button initially
      cancelRef.current?.focus()
      // prevent background scroll
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-ocean-card/95 p-6 shadow-2xl border dark:border-luxborder"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded-lg px-4 py-2 bg-white/60 dark:bg-transparent border text-sm text-slate-700 dark:text-slate-200 hover:bg-white/80"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
