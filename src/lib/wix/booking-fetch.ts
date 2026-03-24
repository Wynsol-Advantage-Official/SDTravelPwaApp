/**
 * Client-safe Wix + Booking helpers.
 *
 * This file is safe to import from Client Components and hooks.
 * It uses the browser Wix client for read-only product fetches,
 * and calls the internal API route for writes (booking initiation).
 *
 * The "Bouncer" pattern:
 *   Frontend → fetch product to SHOW the user the price/details
 *   Backend  → re-fetch product with server client to VERIFY the price
 */

import { wixBrowserClient } from "./client-browser"

/**
 * Fetch a single Wix product by ID from the client side.
 * Used to show the user price and details before booking.
 */
export async function getProductClient(productId: string) {
  const client = wixBrowserClient()
  if (!client) return null

  try {
    const { product } = await client.products.getProduct(productId)
    return product ?? null
  } catch (err) {
    console.error("[Wix Browser] getProduct failed:", err)
    return null
  }
}

/**
 * Fetch all products (tours) from the client side.
 */
export async function getProductsClient() {
  const client = wixBrowserClient()
  if (!client) return []

  try {
    const result = await client.products.queryProducts().find()
    return result.items ?? []
  } catch (err) {
    console.error("[Wix Browser] queryProducts failed:", err)
    return []
  }
}

export interface BookingResult {
  id: string
  data: Record<string, unknown>
  isCheckoutEnabled: boolean
  dataSource: "STORES" | "CMS"
}

/**
 * Initiate a booking via the server-side API route (NOT directly to Wix).
 * The API route handles auth verification, price re-validation, and Firestore write.
 * Returns isCheckoutEnabled (true for Stores, false for CMS → Concierge Hold).
 */
export async function initiateBooking(
  idToken: string,
  tourId: string,
  userPrice: number,
  tourDate?: string,
  guests?: number,
  pickupDetails?: import("@/types/booking").PickupDetails,
): Promise<BookingResult> {
  const res = await fetch("/api/bookings/initiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ tourId, userPrice, tourDate, guests, pickupDetails }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(body.error ?? `Booking failed (${res.status})`)
  }

  return res.json()
}
