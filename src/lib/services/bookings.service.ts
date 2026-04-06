import {
  collection,
  query,
  where,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import type { Booking } from "@/types/booking"

/**
 * Subscribe to a user's bookings in real time.
 *
 * @param uid       - Firebase Auth UID of the current user
 * @param tenantId  - Current tenant identifier (from TenantContext).
 *                    When provided, only bookings with a matching tenantId
 *                    are returned.  Pass `null` to skip the filter (e.g. for
 *                    super_admin cross-tenant views).
 * @param onData    - callback receiving the latest bookings array
 * @param onError   - optional error callback
 * @param maxResults - optional cap on the number of documents
 *
 * Returns an unsubscribe function.
 */
export function subscribeToUserBookings(
  uid: string,
  tenantId: string | null,
  onData: (bookings: Booking[]) => void,
  onError?: (err: Error) => void,
  maxResults?: number,
): Unsubscribe {
  const ref = collection(db, "bookings")
  const constraints: QueryConstraint[] = [
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
  ]
  // Scope to current tenant unless explicitly null (super_admin)
  if (tenantId) {
    constraints.push(where("tenantId", "==", tenantId))
  }
  if (maxResults) constraints.push(fbLimit(maxResults))

  const q = query(ref, ...constraints)

  return onSnapshot(
    q,
    (snap) => {
      const items: Booking[] = snap.docs.map((d) => ({
        _id: d.id,
        ...(d.data() as Omit<Booking, "_id">),
      }))
      onData(items)
    },
    (err) => {
      console.error("[BookingsService] Listener error:", err)
      onError?.(err)
    },
  )
}
