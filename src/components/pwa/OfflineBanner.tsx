"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const onOffline = () => setIsOffline(true)
    const onOnline = () => setIsOffline(false)
    window.addEventListener("offline", onOffline)
    window.addEventListener("online", onOnline)
    return () => {
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("online", onOnline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderBottom: "1px solid #D4AF37",
            borderLeft: "4px solid #D4AF37",
            background: "#1A1A2E",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "14px",
            color: "#F5F5F0",
          }}
          role="status"
          aria-live="polite"
        >
          You&apos;re offline — live chat and booking updates are unavailable
        </motion.div>
      )}
    </AnimatePresence>
  )
}
