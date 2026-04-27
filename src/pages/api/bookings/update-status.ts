import type { NextApiRequest, NextApiResponse } from "next"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { recordActivityAdmin } from "@/lib/firebase/activity-admin"
import { FieldValue } from "firebase-admin/firestore"

// ---------------------------------------------------------------------------
// Valid status transitions — enforced server-side
// ---------------------------------------------------------------------------
const VALID_TRANSITIONS: Record<string, string[]> = {
  hold: ["confirmed", "awaiting_payment", "cancelled"],
  pending: ["confirmed", "awaiting_payment", "cancelled"],
  awaiting_payment: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
}

type Data = { success: boolean } | { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH")
    return res.status(405).json({ error: "Method not allowed" })
  }

  // ── Auth verification ───────────────────────────────────────────────────
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" })
  }

  const idToken = authHeader.split(" ")[1]
  let uid: string
  let callerRole: string | undefined
  let callerTenantId: string | undefined
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    uid = decoded.uid
    callerRole = (decoded.role as string) ?? undefined
    callerTenantId = (decoded.tenantId as string) ?? undefined

    if (!decoded.admin) {
      return res.status(403).json({ error: "Insufficient permissions — admin role required" })
    }
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  // ── Body validation ─────────────────────────────────────────────────────
  const { bookingId, newStatus } = req.body as {
    bookingId?: string
    newStatus?: string
  }

  if (!bookingId || !newStatus) {
    return res.status(400).json({ error: "Missing bookingId or newStatus" })
  }

  // ── Fetch current booking ───────────────────────────────────────────────
  const docRef = adminDb.collection("bookings").doc(bookingId)
  const snap = await docRef.get()

  if (!snap.exists) {
    return res.status(404).json({ error: "Booking not found" })
  }

  // ── Tenant isolation: tenant_admin can only update their own tenant's bookings
  const bookingTenantId = snap.data()?.tenantId as string | undefined
  if (callerRole !== "super_admin" && callerTenantId && bookingTenantId !== callerTenantId) {
    return res.status(403).json({ error: "Cannot modify bookings outside your tenant" })
  }

  const currentStatus = snap.data()?.status as string
  const allowed = VALID_TRANSITIONS[currentStatus]

  if (!allowed?.includes(newStatus)) {
    return res.status(409).json({
      error: `Cannot transition from "${currentStatus}" to "${newStatus}"`,
    })
  }

  // ── Update ──────────────────────────────────────────────────────────────
  try {
    await docRef.update({
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid,
    })
    // ── Activity event ──────────────────────────────────────────────────
    const bookingData = snap.data() ?? {}
    const bookingOwnerUid = bookingData.uid as string | undefined
    const tourTitle = (bookingData.tourTitle as string | undefined) ?? "Your booking"
    const bookingTenantId = bookingData.tenantId as string | undefined

    const STATUS_ACTIVITY: Record<string, { type: import("@/types/activity").ActivityEventType; title: string }> = {
      confirmed: { type: "booking_confirmed", title: "Booking confirmed" },
      completed: { type: "booking_completed", title: "Booking completed" },
      cancelled: { type: "booking_cancelled", title: "Booking cancelled" },
    }

    const activityDef = STATUS_ACTIVITY[newStatus]
    if (activityDef && bookingOwnerUid) {
      await recordActivityAdmin(bookingOwnerUid, {
        type: activityDef.type,
        title: activityDef.title,
        description: tourTitle,
        link: "/dashboard/bookings",
        tenantId: bookingTenantId,
      })
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("[Booking] Status update failed:", err)
    return res.status(500).json({ error: "Failed to update booking status" })
  }
}
