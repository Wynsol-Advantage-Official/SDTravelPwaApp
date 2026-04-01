"use client"

import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Heart, Calendar, MessageCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const ACTIVE_COLOR = "#1282a5"
const INACTIVE_COLOR = "#076a9599"
const NAV_BG = "#043750"
const SIGN_IN_ROUTE = "/auth/sign-in"

interface Tab {
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  href: string
  requiresAuth: boolean
}

const TABS: Tab[] = [
  { label: "Home", icon: Home, href: "/", requiresAuth: false },
  { label: "Saved", icon: Heart, href: "/dashboard/saved", requiresAuth: true },
  { label: "Bookings", icon: Calendar, href: "/my-bookings", requiresAuth: true },
  { label: "Chat", icon: MessageCircle, href: "/dashboard/chat", requiresAuth: true },
]

export default function MobileBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  function handlePress(tab: Tab) {
    if (tab.requiresAuth && !user) {
      router.push(`${SIGN_IN_ROUTE}?redirect=${encodeURIComponent(tab.href)}`)
      return
    }
    router.push(tab.href)
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href) ?? false
  }

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        background: NAV_BG,
        paddingBottom: "env(safe-area-inset-bottom)",
        borderTop: `1px solid ${ACTIVE_COLOR}33`,
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href)
        const Icon = tab.icon

        return (
          <button
            key={tab.href}
            onClick={() => handlePress(tab)}
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "10px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            <motion.div
              animate={{ scale: active ? 1.18 : 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              style={{ position: "relative" }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.75}
                style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR }}
              />
            </motion.div>
            <span
              style={{
                fontSize: "10px",
                lineHeight: 1,
                color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
                fontWeight: active ? 600 : 400,
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
