"use client"

import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils/format"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

const STATUS_CONFIG: Record<BookingStatus, { label: string; icon: string; className: string }> = {
  hold: { label: "On Hold", icon: "◇", className: "bg-amber-100 text-amber-800 border-amber-200" },
  pending: { label: "Pending", icon: "◈", className: "bg-sand-50 text-sand-600 border-sand-200" },
  awaiting_payment: { label: "Awaiting Payment", icon: "⧫", className: "bg-purple-100 text-purple-800 border-purple-200" },
  confirmed: { label: "Confirmed", icon: "✓", className: "bg-green-100 text-green-800 border-green-200" },
  completed: { label: "Completed", icon: "★", className: "bg-ocean-50 text-ocean border-ocean-200" },
  cancelled: { label: "Cancelled", icon: "✕", className: "bg-red-100 text-red-700 border-red-200" },
}

interface BookingHeroProps {
  booking: EnrichedBooking
  heroImage: string | null
  tourDuration?: number
}

export function BookingHero({ booking, heroImage, tourDuration }: BookingHeroProps) {
  const statusInfo = STATUS_CONFIG[booking.status]

  function formatDate(value: unknown): string {
    if (!value) return "—"
    const d = new Date(value as string | number)
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <section className="relative overflow-hidden">
      {/* Hero background */}
      <div className="relative h-64 w-full sm:h-80 lg:h-96">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={booking.tourTitle}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-charcoal via-charcoal/90 to-ocean/30" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-charcoal via-charcoal/60 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-diamond/60">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-gold">Dashboard</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/dashboard/bookings" className="transition-colors hover:text-gold">Bookings</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-diamond">{booking.tourTitle}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
                <span>{statusInfo.icon}</span>
                {statusInfo.label}
              </span>

              <h1 className="mt-3 font-serif text-3xl font-bold text-diamond sm:text-4xl lg:text-5xl">
                {booking.tourTitle}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-diamond/70">
                {booking.tourDate && (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {formatDate(booking.tourDate)}
                  </span>
                )}
                {tourDuration && (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tourDuration} {tourDuration === 1 ? "day" : "days"}
                  </span>
                )}
                {booking.guests && (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-diamond/50">Total</p>
              <p className="font-serif text-3xl font-bold text-gold">
                {formatPrice(booking.totalPrice, booking.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
