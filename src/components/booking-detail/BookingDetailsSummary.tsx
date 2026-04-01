"use client"

import type { EnrichedBooking } from "@/types/booking"
import { formatPrice } from "@/lib/utils/format"

interface BookingDetailsSummaryProps {
  booking: EnrichedBooking
}

function formatTimestamp(value: unknown): string {
  if (!value) return "—"
  const d = new Date(value as string | number)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export function BookingDetailsSummary({ booking }: BookingDetailsSummaryProps) {
  const details: { label: string; value: string; icon: string }[] = [
    { label: "Booking ID", value: booking._id, icon: "🔖" },
    { label: "Tour Date", value: booking.tourDate ?? "TBD", icon: "📅" },
    { label: "Guests", value: booking.guests ? `${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}` : "—", icon: "👥" },
    { label: "Total Price", value: formatPrice(booking.totalPrice, booking.currency), icon: "💎" },
    { label: "Booked On", value: formatTimestamp(booking.createdAt), icon: "📝" },
    { label: "Last Updated", value: formatTimestamp(booking.updatedAt), icon: "🔄" },
  ]

  // Pickup details
  if (booking.pickupDetails) {
    const pd = booking.pickupDetails
    if (pd.type === "flight") {
      details.push(
        { label: "Pickup Type", value: "Airport Transfer", icon: "✈️" },
        { label: "Flight", value: pd.flightNumber ?? `${pd.departureAirport} → ${pd.arrivalAirport}`, icon: "🛫" },
        { label: "Arrival", value: `${pd.arrivalDate} at ${pd.arrivalTime}`, icon: "🕐" },
      )
    } else if (pd.type === "resort") {
      details.push(
        { label: "Pickup Type", value: "Hotel Pickup", icon: "🏨" },
        { label: "Hotel", value: pd.hotelName, icon: "📍" },
      )
    } else if (pd.type === "airbnb") {
      details.push(
        { label: "Pickup Type", value: "Airbnb Pickup", icon: "🏠" },
        { label: "Address", value: pd.address, icon: "📍" },
      )
    }
  }

  return (
    <section>
      <h2 className="font-sans text-2xl font-bold text-ocean-deep">Booking Details</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {details.map(({ label, value, icon }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-lg border border-ocean-deep/5 bg-white p-4"
          >
            <span className="mt-0.5 text-lg">{icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-ocean-deep/50">
                {label}
              </p>
              <p className="mt-0.5 break-all text-sm font-medium text-ocean-deep">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {booking.specialRequests && (
        <div className="mt-4 rounded-lg border border-ocean/20 bg-ocean/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ocean-deep/50">
            Special Requests
          </p>
          <p className="mt-1 text-sm text-ocean-deep/80">{booking.specialRequests}</p>
        </div>
      )}
    </section>
  )
}
