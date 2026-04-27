"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Timer } from "lucide-react"
import { useSessionExpiry } from "@/hooks/useSessionExpiry"
import { useMockMode } from "@/hooks/useMockMode"
import { Button } from "@/components/ui"

const RING_RADIUS = 28
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function SessionExpiryDialog() {
  const { isMockMode } = useMockMode()
  const { showPrompt, countdown, stayLoggedIn, logOut } = useSessionExpiry()

  // No live Firebase session in mock mode — never show
  if (isMockMode) return null

  const progress = countdown / 60 // 1 → 0
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress)

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // z-100 puts this above all other overlays (Modal uses z-50)
          className="fixed inset-0 z-100 flex items-center justify-center bg-ocean-deep/80 p-4 backdrop-blur-sm"
          // Intentionally no click-outside or Escape-key dismissal —
          // the user must make an explicit choice.
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="session-expiry-title"
          aria-describedby="session-expiry-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            }}
            className="w-full max-w-sm rounded-sm bg-white p-8 shadow-2xl dark:bg-ocean-900 dark:ring-1 dark:ring-white/10"
          >
            {/* Countdown ring + icon */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                >
                  {/* Track */}
                  <circle
                    cx="32"
                    cy="32"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-ocean/15"
                  />
                  {/* Progress */}
                  <circle
                    cx="32"
                    cy="32"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    className="text-ocean transition-all duration-1000 ease-linear"
                  />
                </svg>
                <Timer className="h-6 w-6 text-ocean" aria-hidden="true" />
              </div>

              <span
                className="font-sans text-3xl font-semibold tabular-nums text-ocean-deep dark:text-white"
                aria-live="polite"
                aria-atomic="true"
              >
                {countdown}s
              </span>
            </div>

            <h2
              id="session-expiry-title"
              className="mb-2 text-center font-sans text-lg font-semibold text-ocean-deep dark:text-white"
            >
              Your session is expiring
            </h2>
            <p
              id="session-expiry-desc"
              className="mb-8 text-center font-sans text-sm text-ocean-deep/60 dark:text-white/60"
            >
              You&apos;ll be automatically signed out in{" "}
              <span className="font-semibold text-ocean-deep dark:text-white">
                {countdown} seconds
              </span>
              .
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => void stayLoggedIn()}
              >
                Stay logged in
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => void logOut()}
              >
                Sign out
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
