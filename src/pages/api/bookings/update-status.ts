import type { NextApiRequest, NextApiResponse } from "next"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
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
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    uid = decoded.uid

    // Check for admin custom claim — set via Firebase Admin SDK
    // To grant admin: adminAuth.setCustomUserClaims(uid, { admin: true })
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

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("[Booking] Status update failed:", err)
    return res.status(500).json({ error: "Failed to update booking status" })
  }
}
