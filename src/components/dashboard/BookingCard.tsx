"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils/format"
import {
  STATUS_ACTIONS,
  STATUS_BADGE,
  STATUS_ICON,
  STATUS_LABEL,
} from "@/lib/rules/status-rules"
import { getTourGradient } from "@/lib/utils/tour-gradients"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

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
  heroImage?: string | null
}

export function BookingCard({
  booking,
  updating,
  onUpdateStatus,
  onOpenDetail,
  showUser = true,
  heroImage: heroImageProp,
}: BookingCardProps) {
  const [pendingAction, setPendingAction] = useState<{ label: string; to: BookingStatus } | null>(null)
  const actions = STATUS_ACTIONS[booking.status] ?? []
  const initials = getInitials(booking.userName, booking.uid)

  const heroImage = heroImageProp ?? booking.tourHeroImage ?? null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ocean-deep/5 transition-shadow hover:shadow-lg hover:ring-ocean/30"
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
            <div className="font-sans text-lg font-bold text-ocean-deep">
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
          <h3 className="font-sans text-lg font-bold leading-tight text-white drop-shadow-sm">
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
                <div className="min-w-0 text-sm text-ocean-deep">
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
                className="h-9 w-9 rounded-full object-cover ring-2 ring-ocean/30"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-ocean/20 to-tan text-xs font-bold text-ocean-deep ring-2 ring-ocean/30">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.12em] text-ocean-deep/50">
                  Primary guest
                </p>
                <p className="truncate text-sm font-semibold text-ocean-deep">
                  {booking.userName ?? booking.uid.slice(0, 16) + "…"}
                </p>
              <p className="truncate text-xs text-ocean-deep/50">
                {booking.userCountry ?? booking.userEmail ?? "—"}
              </p>
            </div>
          </div>
        )}

        {/* Price detail */}
        <div className="mt-3 flex items-baseline justify-between text-xs text-ocean-deep/60">
          <div>
            <span className="font-medium text-ocean-deep/80">Price:</span>{" "}
            {formatPrice(booking.totalPrice, booking.currency)}
            {booking.userSubmittedPrice != null &&
              booking.userSubmittedPrice !== booking.totalPrice && (
                <span className="ml-1 text-amber-600">
                  (submitted: {formatPrice(booking.userSubmittedPrice, booking.currency)})
                </span>
              )}
          </div>
          {booking.guests != null && (
            <div className="flex flex-col items-end text-ocean-deep/50">
              <div className="text-[10px] uppercase tracking-[0.12em]">Party size</div>
              <div className="mt-0.5 flex items-center gap-1">
                <span>👤</span>
                <span className="font-semibold text-ocean-deep">{booking.guests}</span>
                <span className="text-xs">{booking.guests === 1 ? "guest" : "guests"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Booking ID */}
        <div className="mt-1.5 text-[11px] text-ocean-deep/40">
          ID: <span className="font-mono">{booking._id.slice(0, 20)}</span>
        </div>

        {/* Duration from itinerary child count */}
        {(booking.itineraryDayCount ?? 0) > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-ocean-deep/50">
            <span>🛏️</span>
            <span>Room nights: <span className="font-semibold text-ocean-deep/70">{booking.itineraryDayCount} {booking.itineraryDayCount === 1 ? 'night' : 'nights'}</span></span>
          </div>
        )}

        {/* Action buttons — prevent card click from opening modal */}
        {actions.length > 0 && (
          <div
            className="mt-3 flex flex-wrap gap-1.5 border-t border-ocean-deep/5 pt-3"
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
