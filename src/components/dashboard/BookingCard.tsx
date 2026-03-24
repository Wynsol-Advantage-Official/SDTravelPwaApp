"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils/format"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

// Simple in-memory cache so multiple cards with the same tourId don't re-fetch
const heroCache = new Map<string, string | null>()
const inflight = new Map<string, Promise<string | null>>()

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<BookingStatus, string> = {
  hold: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-sand-50 text-sand-600 border-sand-200",
  awaiting_payment: "bg-purple-100 text-purple-800 border-purple-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-ocean-50 text-ocean border-ocean-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

const STATUS_ICON: Record<BookingStatus, string> = {
  hold: "◇",
  pending: "◈",
  awaiting_payment: "⧫",
  confirmed: "✓",
  completed: "★",
  cancelled: "✕",
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  hold: "Hold",
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_ACTIONS: Record<
  string,
  { label: string; to: BookingStatus; style: string }[]
> = {
  hold: [
    { label: "Approve", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Awaiting Payment", to: "awaiting_payment", style: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Decline", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  pending: [
    { label: "Confirm", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Awaiting Payment", to: "awaiting_payment", style: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  awaiting_payment: [
    { label: "Confirm Payment", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  confirmed: [
    { label: "Complete", to: "completed", style: "bg-ocean hover:bg-ocean/90 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
}

// Gradient backgrounds per tour keyword (fallback when no hero image)
function getTourGradient(title: string): string {
  const t = title.toLowerCase()
  if (t.includes("sahara") || t.includes("desert"))
    return "from-amber-600 via-orange-700 to-red-800"
  if (t.includes("cockpit") || t.includes("country") || t.includes("jungle"))
    return "from-emerald-500 via-green-700 to-teal-800"
  if (t.includes("ocean") || t.includes("beach") || t.includes("coast") || t.includes("island"))
    return "from-sky-500 via-blue-600 to-indigo-800"
  if (t.includes("mountain") || t.includes("peak") || t.includes("alpine"))
    return "from-slate-500 via-gray-700 to-zinc-800"
  if (t.includes("city") || t.includes("urban") || t.includes("metro"))
    return "from-violet-500 via-purple-700 to-fuchsia-800"
  if (t.includes("safari") || t.includes("wild"))
    return "from-yellow-600 via-amber-700 to-orange-800"
  return "from-sand via-gold to-sand-600"
}

function getInitials(name?: string, uid?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  return (uid ?? "?").slice(0, 2).toUpperCase()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BookingCardProps {
  booking: EnrichedBooking
  updating: boolean
  onUpdateStatus: (id: string, status: BookingStatus) => void
  onOpenDetail: (booking: EnrichedBooking) => void
  showUser?: boolean
}

export function BookingCard({
  booking,
  updating,
  onUpdateStatus,
  onOpenDetail,
  showUser = true,
}: BookingCardProps) {
  const [pendingAction, setPendingAction] = useState<{ label: string; to: BookingStatus } | null>(null)
  const actions = STATUS_ACTIONS[booking.status] ?? []
  const initials = getInitials(booking.userName, booking.uid)

  // Resolve hero image from Wix CMS by tourId (collection item _id)
  const [resolvedHero, setResolvedHero] = useState<string | null>(
    () => (booking.tourId ? heroCache.get(booking.tourId) ?? null : null),
  )

  useEffect(() => {
    const tourId = booking.tourId
    if (!tourId) return

    // Already resolved
    if (heroCache.has(tourId)) {
      setResolvedHero(heroCache.get(tourId) ?? null)
      return
    }

    // Deduplicate in-flight requests
    let req = inflight.get(tourId)
    if (!req) {
      req = fetch("/api/bookings/resolve-heroes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourIds: [tourId] }),
      })
        .then((r) => (r.ok ? r.json() : {}))
        .then((map: Record<string, string | null>) => {
          const url = map[tourId] ?? null
          heroCache.set(tourId, url)
          return url
        })
        .catch(() => {
          heroCache.set(tourId, null)
          return null
        })
        .finally(() => inflight.delete(tourId))
      inflight.set(tourId, req)
    }

    req.then((url) => setResolvedHero(url))
  }, [booking.tourId])

  const heroImage = resolvedHero || booking.tourHeroImage || null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-charcoal/5 transition-shadow hover:shadow-lg hover:ring-gold/30"
      onClick={() => onOpenDetail(booking)}
    >
      {/* Hero image / gradient */}
      <div className="relative h-40 w-full overflow-hidden">
        <div
          className={
            heroImage
              ? "h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              : `h-full w-full bg-linear-to-br ${getTourGradient(booking.tourTitle)}`
          }
          style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        >
          {/* Decorative overlay pattern only for gradient fallback */}
          {!heroImage && (
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0zMHY2aC02VjRoNnptMCAzMFY0MGgtNnYtNmg2ek0xMiAxNHY2SDZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-60" />
          )}
        </div>

        {/* Status badge overlay */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${STATUS_BADGE[booking.status]}`}
          >
            <span>{STATUS_ICON[booking.status]}</span>
            {STATUS_LABEL[booking.status]}
          </span>
        </div>

        {/* Price tag overlay */}
        <div className="absolute right-3 top-3">
          <div className="rounded-lg bg-white/90 px-3 py-1.5 text-right backdrop-blur-sm">
            <div className="font-serif text-lg font-bold text-charcoal">
              {formatPrice(booking.totalPrice, booking.currency)}
            </div>
            {booking.isCheckoutEnabled === false && (
              <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-600">
                Concierge
              </span>
            )}
          </div>
        </div>

        {/* Tour title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-4 pb-3 pt-8">
          <h3 className="font-serif text-lg font-bold leading-tight text-white drop-shadow-sm">
            {booking.tourTitle}
          </h3>
        </div>
      </div>

      {/* Floating confirmation overlay (floats above card content) */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            key="confirm-overlay"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 flex items-center justify-center px-4"
          >
            {/* Backdrop that blurs the card behind the prompt */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <div className="relative w-full max-w-sm rounded-2xl bg-white/95 p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm text-charcoal">
                  Confirm <span className="font-semibold">{pendingAction.label}</span>?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingAction(null)
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!pendingAction) return
                      onUpdateStatus(booking._id, pendingAction.to)
                      setPendingAction(null)
                    }}
                    disabled={updating}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {updating ? "…" : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card body */}
      <div className="px-4 pb-4 pt-3">
        {/* User row (optional) */}
        {showUser && (
          <div className="flex items-center gap-3">
            {booking.userAvatar ? (
              <img
                src={booking.userAvatar}
                alt={booking.userName ?? "User"}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-gold/30"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gold to-sand text-xs font-bold text-white ring-2 ring-gold/30">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-charcoal">
                {booking.userName ?? booking.uid.slice(0, 16) + "…"}
              </p>
              <p className="truncate text-xs text-charcoal/50">
                {booking.userCountry ?? booking.userEmail ?? "—"}
              </p>
            </div>
          </div>
        )}

        {/* Price detail */}
        <div className="mt-3 flex items-baseline justify-between text-xs text-charcoal/60">
          <div>
            <span className="font-medium text-charcoal/80">Price:</span>{" "}
            {formatPrice(booking.totalPrice, booking.currency)}
            {booking.userSubmittedPrice != null &&
              booking.userSubmittedPrice !== booking.totalPrice && (
                <span className="ml-1 text-amber-600">
                  (submitted: {formatPrice(booking.userSubmittedPrice, booking.currency)})
                </span>
              )}
          </div>
          {booking.guests != null && (
            <div className="flex items-center gap-1 text-charcoal/50">
              <span>👤</span>
              <span className="font-semibold text-charcoal">{booking.guests}</span>
              <span>{booking.guests === 1 ? "guest" : "guests"}</span>
            </div>
          )}
        </div>

        {/* Booking ID */}
        <div className="mt-1.5 text-[11px] text-charcoal/40">
          ID: <span className="font-mono">{booking._id.slice(0, 20)}</span>
        </div>

        {/* Duration from itinerary child count */}
        {(booking.itineraryDayCount ?? 0) > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-charcoal/50">
            <span>📅</span>
            <span>Duration: <span className="font-semibold text-charcoal/70">{booking.itineraryDayCount} Days</span></span>
          </div>
        )}

        {/* Action buttons — prevent card click from opening modal */}
        {actions.length > 0 && (
          <div
            className="mt-3 flex flex-wrap gap-1.5 border-t border-charcoal/5 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map(({ label, to, style }) => (
                  <button
                    key={to}
                    disabled={updating}
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingAction({ label, to })
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-opacity disabled:opacity-50 ${style}`}
                  >
                    {updating ? "…" : label}
                  </button>
                ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
