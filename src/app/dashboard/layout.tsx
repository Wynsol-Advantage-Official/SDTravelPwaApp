import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard/DashboardNav"

export const metadata: Metadata = {
  title: "My Diamond Trips",
  description: "Manage your luxury travel bookings, wishlist, and concierge chat.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-luxury-base">
      <DashboardNav />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">{children}</div>
    </div>
  )
}
