"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { BookingCard } from "@/components/dashboard/BookingCard"
import { BookingDetailModal } from "@/components/dashboard/BookingDetailModal"
import { auth } from "@/lib/firebase/client"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

const POLL_INTERVAL_MS = 8_000

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_FILTERS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Hold", value: "hold" },
  { label: "Pending", value: "pending" },
  { label: "Awaiting Payment", value: "awaiting_payment" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
]

const STAT_CONFIG = [
  { key: "hold" as const, label: "Holds", icon: "◇", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  { key: "pending" as const, label: "Pending", icon: "◈", color: "text-sand-500", bg: "bg-sand-50 border-sand-100" },
  { key: "awaiting_payment" as const, label: "Awaiting Pay", icon: "⧫", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  { key: "confirmed" as const, label: "Confirmed", icon: "✓", color: "text-green-600", bg: "bg-green-50 border-green-100" },
]

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function ConciergeDashboardPage() {
  return (
    <AuthGuard>
      <ConciergeContent />
    </AuthGuard>
  )
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

function ConciergeContent() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<BookingStatus | "all">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<EnrichedBooking | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── API-based fetch ─────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!auth.currentUser) return

    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch("/api/bookings/admin-list", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      const { bookings: fetched } = (await res.json()) as { bookings: EnrichedBooking[] }
      setBookings(fetched)
      setError(null)
      setLastRefreshed(new Date())
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load bookings"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }

    fetchBookings()

    intervalRef.current = setInterval(fetchBookings, POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, fetchBookings])

  // ── Status update handler ───────────────────────────────────────────────
  const updateStatus = useCallback(
    async (bookingId: string, newStatus: BookingStatus) => {
      if (!user) return

      setUpdatingId(bookingId)
      setError(null)

      try {
        const token = await auth.currentUser?.getIdToken(true)
        const res = await fetch("/api/bookings/update-status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId, newStatus }),
        })

        if (!res.ok) {
          const body = (await res.json()) as { error?: string }
          throw new Error(body.error ?? `Status ${res.status}`)
        }

        await fetchBookings()

        // Update selected booking in modal too
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking((prev) =>
            prev ? { ...prev, status: newStatus } : null,
          )
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Update failed"
        setError(msg)
      } finally {
        setUpdatingId(null)
      }
    },
    [user, fetchBookings, selectedBooking],
  )

  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter)

  // ── Stats ───────────────────────────────────────────────────────────────
  const statCounts: Record<string, number> = {
    hold: bookings.filter((b) => b.status === "hold").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    awaiting_payment: bookings.filter((b) => b.status === "awaiting_payment").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-charcoal-50/40">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Concierge Dashboard
            </h1>
            <p className="mt-1 text-sm text-charcoal/50">
              Manage bookings, approve holds, and track payment status in real time.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="rounded-xl border border-charcoal/10 bg-white px-4 py-2 text-xs font-semibold text-charcoal/70 shadow-sm transition-all hover:border-gold hover:text-gold hover:shadow disabled:opacity-50"
            >
              ↻ Refresh
            </button>
            {lastRefreshed && (
              <span className="text-[10px] text-charcoal/35">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_CONFIG.map(({ key, label, icon, color, bg }) => (
            <div
              key={key}
              className={`rounded-2xl border p-4 ${bg} transition-shadow hover:shadow-sm`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg ${color}`}>{icon}</span>
                <span className="text-2xl font-bold text-charcoal">
                  {statCounts[key] ?? 0}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-charcoal/50">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={[
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                filter === value
                  ? "bg-gold text-white shadow-sm"
                  : "bg-white text-charcoal/50 shadow-sm ring-1 ring-charcoal/5 hover:ring-gold/30 hover:text-charcoal",
              ].join(" ")}
            >
              {label}
              {value !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {bookings.filter((b) => b.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-gold border-t-transparent" />
              <p className="text-sm text-charcoal/40">Loading bookings…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-charcoal/10 bg-white/50 py-20">
            <div className="text-center">
              <div className="mb-3 text-4xl text-charcoal/15">◇</div>
              <p className="text-sm text-charcoal/40">
                {filter === "all"
                  ? "No bookings yet."
                  : `No ${filter.replace("_", " ")} bookings.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  updating={updatingId === booking._id}
                  onUpdateStatus={updateStatus}
                  onOpenDetail={setSelectedBooking}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedBooking && user && (
        <BookingDetailModal
          booking={selectedBooking}
          agentUid={user.uid}
          updating={updatingId === selectedBooking._id}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  )
}
