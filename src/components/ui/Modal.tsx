"use client"

import { useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "Dialog"}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            className="relative w-full max-w-lg rounded-sm bg-white p-6 shadow-xl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:text-charcoal"
              aria-label="Close dialog"
            >
              ✕
            </button>

            {title && (
              <h2 className="mb-4 font-serif text-xl font-semibold text-charcoal">
                {title}
              </h2>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
