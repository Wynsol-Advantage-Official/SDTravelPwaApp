"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { useUserBookings } from "@/hooks/useUserBookings"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { BookingCard } from "@/components/dashboard/BookingCard"
import { Button } from "@/components/ui/Button"
import type { BookingStatus, EnrichedBooking } from "@/types/booking"

const FILTER_OPTIONS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

export default function BookingsPage() {
  return (
    <AuthGuard>
      <BookingsContent />
    </AuthGuard>
  )
}

function BookingsContent() {
  const { user } = useAuth()
  const { isMockMode } = useMockMode()
  const router = useRouter()

  const { bookings, loading } = useUserBookings()
  const [filter, setFilter] = useState<BookingStatus | "all">("all")

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-sans text-2xl font-bold text-ocean-deep">
          My Bookings
        </h1>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === value
                  ? "bg-ocean text-ocean-deep"
                  : "bg-ocean/5 text-ocean-deep/60 hover:bg-ocean-deep/10",
              ].join(" ")}
            >
              {label}
              {value !== "all" && (
                <span className="ml-1 opacity-60">
                  {bookings.filter((b) => b.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
          <p className="text-ocean-deep/50">Loading your bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-ocean-deep/50">
            {filter === "all"
              ? "No bookings yet."
              : `No ${filter} bookings.`}
          </p>
          <Button href="/tours" className="mt-4">
            Explore Tours
          </Button>
        </div>
      ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                updating={false}
                showUser={false}
                onUpdateStatus={() => undefined}
                onOpenDetail={(b) => router.push(`/my-bookings/${b._id}`)}
              />
            ))}
          </div>
      )}
    </div>
  )
}
