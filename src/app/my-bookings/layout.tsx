import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Bookings",
  description:
    "View and manage your luxury travel bookings — real-time status updates from your dedicated Diamond concierge.",
}

export default function MyBookingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
