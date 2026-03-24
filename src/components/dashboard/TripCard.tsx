"use client"

import Link from "next/link"
import type { EnrichedBooking } from "@/types/booking"
import { formatPrice, formatDateRange } from "@/lib/utils/format"

interface TripCardProps {
  booking: EnrichedBooking
}

const statusColors: Record<string, string> = {
  hold: "bg-amber-50 text-amber-700",
  pending: "bg-sand/20 text-sand-600",
  awaiting_payment: "bg-purple-50 text-purple-700",
  confirmed: "bg-green-50 text-green-700",
  completed: "bg-ocean/10 text-ocean",
  cancelled: "bg-red-50 text-red-600",
}

export function TripCard({ booking }: TripCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-sand/20 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Link
          href={`/tours/${booking.tourSlug ?? booking.tourId ?? ""}`}
          className="font-serif text-lg font-semibold text-charcoal transition-colors hover:text-ocean"
        >
          {booking.tourTitle}
        </Link>
        <p className="text-sm text-charcoal/60">
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
        <span className="font-serif text-lg font-bold text-charcoal">
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
