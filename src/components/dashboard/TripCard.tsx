"use client"

import Link from "next/link"
import type { EnrichedBooking } from "@/types/booking"
import { formatPrice, formatDateRange } from "@/lib/utils/format"

interface TripCardProps {
  booking: EnrichedBooking
}

const statusColors: Record<string, string> = {
  hold: "bg-amber-900/30 text-amber-400",
  pending: "bg-blue-chill/10 text-blue-chill",
  awaiting_payment: "bg-purple-900/30 text-purple-400",
  confirmed: "bg-green-900/30 text-green-400",
  completed: "bg-ocean/10 text-ocean-300",
  cancelled: "bg-red-900/30 text-red-400",
}

export function TripCard({ booking }: TripCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-khaki/40 bg-white p-5 transition-colors dark:border-white/10 dark:bg-ocean-card sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Link
          href={`/tours/${booking.tourSlug ?? booking.tourId ?? ""}`}
          className="font-sans text-lg font-semibold text-ocean-deep transition-colors hover:text-blue-chill dark:text-white dark:hover:text-blue-chill-300"
        >
          {booking.tourTitle}
        </Link>
        <p className="text-sm text-ocean-deep/60 dark:text-white/60">
          {booking.dates
            ? `${formatDateRange(new Date(booking.dates.start), new Date(booking.dates.end))} · `
            : booking.tourDate
              ? `${booking.tourDate} · `
              : ""}
          {(booking.itineraryDayCount ?? 0) > 0
            ? `${booking.itineraryDayCount} Days · `
            : ""}
          {booking.guests != null
            ? `${booking.guests} guest${booking.guests !== 1 ? "s" : ""}`
            : ""}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-sans text-lg font-bold text-ocean-deep dark:text-white">
          {formatPrice(booking.totalPrice, booking.currency)}
        </span>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${statusColors[booking.status] ?? ""}`}
        >
          {booking.status}
        </span>
      </div>
    </div>
  )
}
