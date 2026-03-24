"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { BookingCard } from "@/components/dashboard/BookingCard"
import { Button } from "@/components/ui/Button"
import { mockBookings } from "@/mocks"
import type { Booking, BookingStatus, EnrichedBooking } from "@/types/booking"

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

  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<BookingStatus | "all">("all")

  useEffect(() => {
    if (isMockMode) {
      setBookings(mockBookings)
      setLoading(false)
      return
    }

    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }

    const ref = collection(db, "bookings")
    const q = query(ref, where("uid", "==", user.uid), orderBy("createdAt", "desc"))

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        _id: d.id,
        ...(d.data() as Omit<Booking, "_id">),
      })) as EnrichedBooking[]
      setBookings(items)
      setLoading(false)
    })

    return unsub
  }, [user, isMockMode])

  // Image enrichment is now handled inside BookingCard itself via tourId lookup

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-2xl font-bold text-charcoal">
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
                  ? "bg-gold text-charcoal"
                  : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10",
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
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-charcoal/50">Loading your bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-charcoal/50">
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
