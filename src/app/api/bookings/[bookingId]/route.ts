import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase/admin"
import { getTourBySlug } from "@/lib/wix/tours"

// ---------------------------------------------------------------------------
// GET /api/bookings/[bookingId] — Fetch single booking + related tour data
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ bookingId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { bookingId } = await context.params

    // Authenticate
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await adminAuth.verifyIdToken(token)
    const uid = decoded.uid
    const isAdmin = decoded.admin === true
    const callerRole = (decoded.role as string) ?? undefined
    const callerTenantId = (decoded.tenantId as string) ?? undefined

    // Fetch booking from Firestore
    const bookingDoc = await adminDb.collection("bookings").doc(bookingId).get()
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const booking = { _id: bookingDoc.id, ...bookingDoc.data() }
    const bookingUid = (booking as Record<string, unknown>).uid as string
    const bookingTenantId = (booking as Record<string, unknown>).tenantId as string | undefined

    // Only allow owner or admin
    if (bookingUid !== uid && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Tenant isolation: tenant_admin can only view their own tenant's bookings
    if (isAdmin && callerRole !== "super_admin" && callerTenantId && bookingTenantId !== callerTenantId) {
      return NextResponse.json({ error: "Forbidden — booking belongs to another tenant" }, { status: 403 })
    }

    // Fetch related tour data from Wix CMS if tourSlug exists
    let tour = null
    let itinerary = null
    let destination = null
    let rooms = null

    const tourSlug = (booking as Record<string, unknown>).tourSlug as string | undefined
    if (tourSlug) {
      const result = await getTourBySlug(tourSlug)
      if (result) {
        tour = result.tour
        itinerary = result.itinerary
        destination = result.destination
        rooms = result.rooms
      }
    }

    return NextResponse.json({
      booking,
      tour,
      itinerary,
      destination,
      rooms,
    })
  } catch (err) {
    console.error("[Booking Detail] Error:", err)
    const msg = err instanceof Error ? err.message : "Server error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
