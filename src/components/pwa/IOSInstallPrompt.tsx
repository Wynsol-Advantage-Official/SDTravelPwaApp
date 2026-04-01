"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only run on iOS Safari, not in standalone mode
    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isStandalone =
      "standalone" in window.navigator &&
      (window.navigator as unknown as { standalone: boolean }).standalone
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS/i.test(ua)

    if (!isIOS || isStandalone || !isSafari) return

    // Check if user has previously dismissed
    if (localStorage.getItem("pwa-prompt-dismissed") === "true") return

    // Track visit count — only show after ≥ 2 visits
    const visits = Number(localStorage.getItem("pwa-visit-count") || "0") + 1
    localStorage.setItem("pwa-visit-count", String(visits))

    if (visits >= 2) {
      setShow(true)
    }
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem("pwa-prompt-dismissed", "true")
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          style={{
            position: "fixed",
            bottom: "calc(64px + env(safe-area-inset-bottom))",
            left: 0,
            right: 0,
            zIndex: 60,
            margin: "0 12px",
            padding: "20px",
            borderRadius: "16px",
            background: "var(--color-ocean-deep)",
            border: "1px solid var(--color-blue-chill, #1282a5)44",
            boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.4)",
          }}
          role="dialog"
          aria-label="Install Sand Diamonds Travel"
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            {/* Apple share icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-blue-chill, #1282a5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: "2px" }}
              aria-hidden="true"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                Install Sand Diamonds Travel
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: 1.5,
                  color: "#ffffffCC",
                }}
              >
                Tap the{" "}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-blue-chill, #1282a5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "inline", verticalAlign: "middle" }}
                  aria-hidden="true"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>{" "}
                share icon, then &ldquo;Add to Home Screen&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={dismiss}
            style={{
              display: "block",
              width: "100%",
              marginTop: "16px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "#1282a5",
              color: "var(--color-ocean-deep)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
