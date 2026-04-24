import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

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
    <div className="flex min-h-dvh flex-col transition-colors duration-300 dark:bg-luxury-base">
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
