import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — Sand Diamonds Travel",
  description: "Access your luxury travel dashboard, bookings, and concierge chat.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-charcoal px-4 py-12">
      {/* Ambient gradient behind the card */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/80" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
