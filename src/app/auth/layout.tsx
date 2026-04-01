import type { Metadata } from "next"
import { BRAND } from "@/lib/config/brand"

export const metadata: Metadata = {
  title: `Sign In — ${BRAND.name}`,
  description: "Access your luxury travel dashboard, bookings, and concierge chat.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-tan-50 px-4 py-12 dark:bg-ocean-deep">
      {/* Ambient gradient behind the card */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-khaki/20 via-khaki/10 to-transparent dark:from-ocean-deep dark:via-ocean-deep/95 dark:to-ocean-deep/80" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
