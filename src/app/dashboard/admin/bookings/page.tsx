"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/Card"
import { formatPrice } from "@/lib/utils/format"
import { Search, RefreshCw, Loader2, FlipHorizontal2, ArrowUpRight } from "lucide-react"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<BookingStatus, string> = {
  hold: "bg-amber-100 text-amber-800",
  pending: "bg-tan-50 text-tan-600",
  awaiting_payment: "bg-purple-100 text-purple-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-ocean-50 text-ocean",
  cancelled: "bg-red-100 text-red-700",
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  hold: "Hold",
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

const VALID_TRANSITIONS: Record<string, { label: string; to: BookingStatus }[]> = {
  hold: [
    { label: "Confirm", to: "confirmed" },
    { label: "Awaiting Payment", to: "awaiting_payment" },
    { label: "Cancel", to: "cancelled" },
  ],
  pending: [
    { label: "Confirm", to: "confirmed" },
    { label: "Awaiting Payment", to: "awaiting_payment" },
    { label: "Cancel", to: "cancelled" },
  ],
  awaiting_payment: [
    { label: "Confirm Payment", to: "confirmed" },
    { label: "Cancel", to: "cancelled" },
  ],
  confirmed: [
    { label: "Complete", to: "completed" },
    { label: "Cancel", to: "cancelled" },
  ],
}

const FILTER_TABS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Hold", value: "hold" },
  { label: "Awaiting Payment", value: "awaiting_payment" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

const AVATAR_PLACEHOLDER_SRC = "/logos/brand/Iconset-06.png"

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminBookingsPage() {
  return (
    <AuthGuard requiredRole="tenant_admin">
      <BookingsManagement />
    </AuthGuard>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function BookingsManagement() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")

  // ── Fetch bookings ────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch("/api/bookings/admin-list", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // ── Client-side filtering ─────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.tourTitle?.toLowerCase().includes(q) ||
      b.userName?.toLowerCase().includes(q) ||
      b.userEmail?.toLowerCase().includes(q) ||
      b._id.toLowerCase().includes(q) ||
      (b.tourId as string | undefined)?.toLowerCase().includes(q) ||
      (b.uid as string | undefined)?.toLowerCase().includes(q) ||
      (b.tenantId as string | undefined)?.toLowerCase().includes(q)
    )
  })

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ocean-deep dark:text-tan-100">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
            {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-ocean-deep/10 px-3 py-2 text-sm font-medium text-ocean-deep/70 hover:bg-ocean-deep/5 dark:border-tan-100/10 dark:text-tan-100/70 dark:hover:bg-tan-100/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Sticky filter strip + search */}
      <div className="z-20 -mx-2 rounded-xl border border-ocean-deep/10 bg-white/90 px-2 py-2 backdrop-blur-md dark:border-tan-100/10 dark:bg-ocean-deep/85">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab.value
                    ? "bg-ocean text-white"
                    : "bg-ocean-deep/5 text-ocean-deep/60 hover:bg-ocean-deep/10 dark:bg-tan-100/5 dark:text-tan-100/60 dark:hover:bg-tan-100/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-deep/30 dark:text-tan-100/30" />
            <input
              type="text"
              placeholder="Search bookings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-ocean-deep/10 bg-white py-2 pl-9 pr-3 text-sm text-ocean-deep placeholder:text-ocean-deep/30 dark:border-tan-100/10 dark:bg-ocean-deep/50 dark:text-tan-100 dark:placeholder:text-tan-100/30 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Loading state */}
      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-ocean-deep/30 dark:text-tan-100/30" />
            <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50">Loading bookings…</p>
          </div>
        </Card>
      ) : error ? null : filtered.length === 0 ? (
        /* Empty state */
        <Card className="p-12">
          <div className="text-center">
            <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50">
              {bookings.length === 0
                ? "No bookings yet."
                : "No bookings match the current filters."}
            </p>
          </div>
        </Card>
      ) : (
        /* Flippable booking cards */
        <Card className="p-4 sm:p-5">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}
          >
            {filtered.map((b) => (
              <BookingFlipCard
                key={b._id}
                booking={b}
              />
            ))}
          </div>
        </Card>
      )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function BookingFlipCard({
  booking,
}: {
  booking: EnrichedBooking
}) {
  const [flipped, setFlipped] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState(
    booking.userAvatar ?? AVATAR_PLACEHOLDER_SRC,
  )
  const createdAt = booking.createdAt
    ? new Date(booking.createdAt as unknown as string).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—"
  const itineraryDays = booking.itineraryDayCount
    ? `${booking.itineraryDayCount} day${booking.itineraryDayCount > 1 ? "s" : ""}`
    : "—"
  const pickupType = booking.pickupDetails?.type === "flight"
    ? "Airport"
    : booking.pickupDetails?.type === "resort"
      ? "Hotel"
      : booking.pickupDetails?.type === "airbnb"
        ? "Airbnb"
        : "—"
  const primaryGuest = booking.userName || "—"
  const partySize = booking.guests
    ? `${booking.guests} guest${booking.guests > 1 ? "s" : ""}`
    : "—"
  const roomNights = (() => {
    const start = booking.dates?.start ? new Date(booking.dates.start as unknown as string) : null
    const end = booking.dates?.end ? new Date(booking.dates.end as unknown as string) : null

    if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const diffMs = end.getTime() - start.getTime()
      const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))
      return `${nights} night${nights > 1 ? "s" : ""}`
    }

    if (booking.itineraryDayCount && booking.itineraryDayCount > 1) {
      const nights = booking.itineraryDayCount - 1
      return `${nights} night${nights > 1 ? "s" : ""}`
    }

    return "—"
  })()

  useEffect(() => {
    setAvatarSrc(booking.userAvatar ?? AVATAR_PLACEHOLDER_SRC)
  }, [booking.userAvatar])

  return (
    <article className="relative h-84" style={{ perspective: "1200px" }}>
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <section
          className="absolute inset-0 overflow-hidden rounded-xl border border-ocean-deep/10 bg-white p-4 shadow-sm dark:border-tan-100/10 dark:bg-ocean-deep"
          style={{
            backfaceVisibility: "hidden",
            pointerEvents: flipped ? "none" : "auto",
          }}
        >
          {booking.tourHeroImage && (
            <>
              <img
                src={booking.tourHeroImage}
                alt={booking.tourTitle || "Tour image"}
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-xl object-cover"
              />
              <div className="absolute inset-0 rounded-xl bg-linear-to-b from-ocean-deep/45 via-ocean-deep/55 to-ocean-deep/80" />
            </>
          )}
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={avatarSrc}
                  alt={(booking.userName?.[0] ?? booking.userEmail?.[0] ?? "?").toUpperCase()}
                  loading="lazy"
                  onError={() => {
                    if (avatarSrc !== AVATAR_PLACEHOLDER_SRC) {
                      setAvatarSrc(AVATAR_PLACEHOLDER_SRC)
                    }
                  }}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${booking.tourHeroImage ? "text-white" : "text-ocean-deep dark:text-tan-100"}`}>
                    {booking.tourTitle || "Tour"}
                  </p>
                  <p className={`truncate text-[11px] ${booking.tourHeroImage ? "text-white/80" : "text-ocean-deep/65 dark:text-tan-100/70"}`}>
                    Status: {STATUS_LABEL[booking.status] ?? booking.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 border-t border-ocean-deep/10 pt-3 dark:border-tan-100/10">
              <div className="col-span-2 rounded-lg border border-white/25 bg-white/12 p-2 backdrop-blur-xs">
                <p className={`text-[10px] uppercase tracking-wider ${booking.tourHeroImage ? "text-white/65" : "text-ocean-deep/40 dark:text-tan-100/40"}`}>
                  Primary Guest
                </p>
                <p className={`mt-1 truncate text-xs font-semibold ${booking.tourHeroImage ? "text-white" : "text-ocean-deep dark:text-tan-100"}`}>
                  {primaryGuest}
                </p>
              </div>
              <div className="rounded-lg border border-white/25 bg-white/12 p-2 backdrop-blur-xs">
                <p className={`text-[10px] uppercase tracking-wider ${booking.tourHeroImage ? "text-white/65" : "text-ocean-deep/40 dark:text-tan-100/40"}`}>
                  Party Size
                </p>
                <p className={`mt-1 text-xs font-semibold ${booking.tourHeroImage ? "text-white" : "text-ocean-deep dark:text-tan-100"}`}>
                  {partySize}
                </p>
              </div>
              <div className="rounded-lg border border-white/25 bg-white/12 p-2 backdrop-blur-xs">
                <p className={`text-[10px] uppercase tracking-wider ${booking.tourHeroImage ? "text-white/65" : "text-ocean-deep/40 dark:text-tan-100/40"}`}>
                  Room Nights
                </p>
                <p className={`mt-1 text-xs font-semibold ${booking.tourHeroImage ? "text-white" : "text-ocean-deep dark:text-tan-100"}`}>
                  {roomNights}
                </p>
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${booking.tourHeroImage ? "text-white/65" : "text-ocean-deep/40 dark:text-tan-100/40"}`}>
                  Date
                </p>
                <p className={`text-xs font-medium ${booking.tourHeroImage ? "text-white/90" : "text-ocean-deep/70 dark:text-tan-100/70"}`}>
                  {createdAt}
                </p>
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${booking.tourHeroImage ? "text-white/65" : "text-ocean-deep/40 dark:text-tan-100/40"}`}>
                  Price
                </p>
                <p className={`text-xs font-semibold ${booking.tourHeroImage ? "text-white" : "text-ocean-deep dark:text-tan-100"}`}>
                  {formatPrice(booking.totalPrice ?? 0, booking.currency ?? "USD")}
                </p>
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${booking.tourHeroImage ? "text-white/65" : "text-ocean-deep/40 dark:text-tan-100/40"}`}>
                  Itinerary
                </p>
                <p className={`text-xs font-medium ${booking.tourHeroImage ? "text-white/90" : "text-ocean-deep/70 dark:text-tan-100/70"}`}>
                  {itineraryDays}
                </p>
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${booking.tourHeroImage ? "text-white/65" : "text-ocean-deep/40 dark:text-tan-100/40"}`}>
                  Pickup
                </p>
                <p className={`text-xs font-medium ${booking.tourHeroImage ? "text-white/90" : "text-ocean-deep/70 dark:text-tan-100/70"}`}>
                  {pickupType}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center">
              <div className="ml-auto flex items-center gap-3">
                <Link
                  href={`/booking/${encodeURIComponent(booking._id)}`}
                  className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    booking.tourHeroImage
                      ? "border-white/30 text-white hover:bg-white/10"
                      : "border-ocean-deep/15 text-ocean-deep/70 hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100/70 dark:hover:bg-tan-100/5"
                  }`}
                >
                  Open
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  aria-label="Flip card"
                  className={`rounded-md border p-2 transition-colors ${
                    booking.tourHeroImage
                      ? "border-white/30 text-white hover:bg-white/10"
                      : "border-ocean-deep/15 text-ocean-deep/70 hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100/70 dark:hover:bg-tan-100/5"
                  }`}
                >
                  <FlipHorizontal2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="absolute inset-0 overflow-hidden rounded-xl border border-ocean-deep/10 bg-white p-4 shadow-sm dark:border-tan-100/10 dark:bg-ocean-deep"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            pointerEvents: flipped ? "auto" : "none",
          }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-ocean-deep dark:text-tan-100">
                Booking Details
              </p>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 rounded-lg bg-ocean-deep/4 p-2 dark:bg-tan-100/5">
                <dt className="text-[10px] uppercase tracking-wider text-ocean-deep/40 dark:text-tan-100/40">
                  Booking ID
                </dt>
                <dd className="mt-1 truncate font-mono text-ocean-deep/70 dark:text-tan-100/70" title={booking._id}>
                  {booking._id}
                </dd>
              </div>
              <div className="rounded-lg bg-ocean-deep/4 p-2 dark:bg-tan-100/5">
                <dt className="text-[10px] uppercase tracking-wider text-ocean-deep/40 dark:text-tan-100/40">
                  Tour ID
                </dt>
                <dd className="mt-1 truncate font-mono text-ocean-deep/70 dark:text-tan-100/70" title={booking.tourId as string | undefined}>
                  {(booking.tourId as string) || "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-ocean-deep/4 p-2 dark:bg-tan-100/5">
                <dt className="text-[10px] uppercase tracking-wider text-ocean-deep/40 dark:text-tan-100/40">
                  UID
                </dt>
                <dd className="mt-1 truncate font-mono text-ocean-deep/70 dark:text-tan-100/70" title={booking.uid as string | undefined}>
                  {(booking.uid as string) || "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-ocean-deep/4 p-2 dark:bg-tan-100/5">
                <dt className="text-[10px] uppercase tracking-wider text-ocean-deep/40 dark:text-tan-100/40">
                  Tenant
                </dt>
                <dd className="mt-1 font-mono text-ocean-deep/70 dark:text-tan-100/70">
                  {(booking.tenantId as string) || "www"}
                </dd>
              </div>
              <div className="rounded-lg bg-ocean-deep/4 p-2 dark:bg-tan-100/5">
                <dt className="text-[10px] uppercase tracking-wider text-ocean-deep/40 dark:text-tan-100/40">
                  Total
                </dt>
                <dd className="mt-1 font-semibold text-ocean-deep dark:text-tan-100">
                  {formatPrice(booking.totalPrice ?? 0, booking.currency ?? "USD")}
                </dd>
              </div>
            </dl>

            <div className="mt-auto flex items-center border-t border-ocean-deep/10 pt-3 dark:border-tan-100/10">
              <div className="ml-auto flex items-center gap-3">
                <Link
                  href={`/booking/${encodeURIComponent(booking._id)}`}
                  className="inline-flex items-center gap-1 rounded-md border border-ocean-deep/15 px-3 py-1.5 text-xs font-medium text-ocean-deep/70 transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100/70 dark:hover:bg-tan-100/5"
                >
                  Open
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setFlipped(false)
                  }}
                  aria-label="Flip card"
                  className="rounded-md border border-ocean-deep/15 p-2 text-ocean-deep/70 transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100/70 dark:hover:bg-tan-100/5"
                >
                  <FlipHorizontal2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  )
}
