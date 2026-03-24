import { wixClient } from "./client"
import type { BookingAvailability } from "@/types/booking"

const BOOKINGS_SERVICE_SLUG = "luxury-tour-booking"

/**
 * Fetch available slots for a given tour/service from Wix Bookings.
 */
export async function getAvailability(
  startDate: string,
  endDate: string,
): Promise<BookingAvailability[]> {
  const client = wixClient()
  if (!client) return []

  try {
    const result = await client.availabilityCalendar.queryAvailability({
      filter: {
        serviceSlug: BOOKINGS_SERVICE_SLUG,
        startDate,
        endDate,
      },
    })

    return (result.availabilityEntries ?? []).map((entry) => ({
      date: entry.slot?.startDate ?? "",
      spotsAvailable: entry.openSpots ?? 0,
      pricePerPerson: 0,
      currency: "USD",
    }))
  } catch (err) {
    console.error("Wix availability fetch failed:", err)
    return []
  }
}

/**
 * Initiate a booking via the server-side API route (not directly to Wix).
 * The API route handles auth verification, price validation, and Firestore write.
 */
export async function initiateBooking(
  idToken: string,
  productId: string,
  userPrice: number,
  tourDate?: string,
): Promise<{ id: string; data: Record<string, unknown> }> {
  const res = await fetch("/api/bookings/initiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ productId, userPrice, tourDate }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(body.error ?? `Booking failed (${res.status})`)
  }

  return res.json()
}
