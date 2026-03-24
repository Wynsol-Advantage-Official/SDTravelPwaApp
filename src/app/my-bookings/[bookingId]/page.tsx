"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/hooks/useAuth"
import { getIdToken } from "@/lib/firebase/auth"
import { getWixImageUrl } from "@/lib/wix/media"
import {
  BookingHero,
  BookingDetailsSummary,
  WhatsIncluded,
  PolicySections,
} from "@/components/booking-detail"
import type { Booking } from "@/types/booking"
import type { Tour, ItineraryDay, Destination, Accommodation } from "@/types/tour"

// Code-split heavy sections
const ItinerarySection = dynamic(
  () => import("@/components/booking-detail/ItinerarySection").then((m) => ({ default: m.ItinerarySection })),
  { loading: () => <SectionSkeleton /> },
)
const DestinationGallery = dynamic(
  () => import("@/components/booking-detail/DestinationGallery").then((m) => ({ default: m.DestinationGallery })),
  { loading: () => <SectionSkeleton /> },
)
const RouteMap = dynamic(
  () => import("@/components/booking-detail/RouteMap").then((m) => ({ default: m.RouteMap })),
  { loading: () => <SectionSkeleton /> },
)
const BookingChatPanel = dynamic(
  () => import("@/components/booking-detail/BookingChatPanel").then((m) => ({ default: m.BookingChatPanel })),
  { ssr: false },
)

function SectionSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-charcoal/3 p-8">
      <div className="mb-4 h-6 w-48 rounded bg-charcoal/10" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-charcoal/5" />
        <div className="h-4 w-3/4 rounded bg-charcoal/5" />
        <div className="h-4 w-1/2 rounded bg-charcoal/5" />
      </div>
    </div>
  )
}

interface BookingDetailData {
  booking: Booking
  tour: Tour | null
  itinerary: ItineraryDay[] | null
  destination: Destination | null
  accommodations: Accommodation[] | null
}

export default function BookingDetailPage() {
  const rawParams = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [data, setData] = useState<BookingDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bookingId = (rawParams?.bookingId as string) ?? ""

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return

    setLoading(true)
    setError(null)

    try {
      const token = await getIdToken()
      if (!token) {
        router.replace("/auth/sign-in")
        return
      }

      const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401) {
        router.replace("/auth/sign-in")
        return
      }
      if (res.status === 403) {
        setError("You do not have access to this booking.")
        return
      }
      if (res.status === 404) {
        setError("Booking not found.")
        return
      }
      if (!res.ok) {
        throw new Error("Failed to load booking")
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("[BookingDetail] Fetch error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [bookingId, router])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/auth/sign-in")
      return
    }
    fetchBooking()
  }, [user, authLoading, fetchBooking, router])

  // ── Loading state ──────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-diamond">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-gold border-t-transparent" />
          <p className="mt-4 text-sm text-charcoal/50">Loading your booking…</p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-diamond px-4">
        <div className="mx-auto max-w-md rounded-2xl border border-charcoal/5 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="font-serif text-xl text-charcoal">{error ?? "Unable to load booking"}</h2>
          <p className="mt-2 text-sm text-charcoal/50">
            If this issue persists, contact your concierge team.
          </p>
          <button
            type="button"
            onClick={() => router.push("/my-bookings")}
            className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-gold/90"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    )
  }

  const { booking, tour, itinerary, destination } = data

  // Build hero image URL
  const heroSrc = tour?.heroImage
    ? getWixImageUrl(tour.heroImage.src, { width: 1920, height: 800 })
    : ((booking as unknown as Record<string, unknown>).tourHeroImage as string | null) ?? null

  // Collect gallery images: tour gallery + destination gallery
  const galleryImages = [
    ...(tour?.gallery ?? []),
    ...(destination?.gallery ?? []),
  ]

  return (
    <main className="min-h-screen bg-diamond pb-24">
      {/* Hero */}
      <BookingHero
        booking={{ ...booking, tourHeroImage: heroSrc ?? undefined } as never}
        heroImage={heroSrc}
        tourDuration={tour?.duration}
      />

      {/* Content sections */}
      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-12 sm:px-6 lg:px-8">
        {/* Booking Summary Details */}
        <section>
          <BookingDetailsSummary booking={booking} />
        </section>

        {/* Itinerary + Calendar */}
        {itinerary && itinerary.length > 0 && (
          <section>
            <ItinerarySection
              itinerary={itinerary}
              tourDate={booking.tourDate ?? null}
            />
          </section>
        )}

        {/* Destination Gallery */}
        {galleryImages.length > 0 && (
          <section>
            <DestinationGallery
              images={galleryImages}
              title={destination?.name ?? tour?.title ?? "Gallery"}
            />
          </section>
        )}

        {/* What's Included */}
        {tour && (tour.included || tour.excluded) && (
          <section>
            <WhatsIncluded
              included={tour.included}
              excluded={tour.excluded}
            />
          </section>
        )}

        {/* Route Map */}
        {((itinerary && itinerary.length > 0) || destination) && (
          <section>
            <RouteMap
              itinerary={itinerary ?? []}
              destination={destination}
            />
          </section>
        )}

        {/* Policy Sections */}
        <section>
          <PolicySections />
        </section>
      </div>

      {/* Floating Chat Panel */}
      <BookingChatPanel bookingId={bookingId} />
    </main>
  )
}
