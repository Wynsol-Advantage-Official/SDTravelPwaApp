import {
  collection,
  addDoc,
  query,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import type { ActivityItem, ActivityEventType } from "@/types/activity"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Firestore document shape (timestamps are Firestore Timestamp on read). */
interface ActivityDoc {
  type: ActivityEventType
  title: string
  description: string
  timestamp: Timestamp
  link?: string
  tenantId?: string
}

function docToItem(id: string, data: ActivityDoc): ActivityItem {
  return {
    id,
    type: data.type,
    title: data.title,
    description: data.description,
    timestamp: data.timestamp.toDate(),
    link: data.link,
    tenantId: data.tenantId,
  }
}

// ---------------------------------------------------------------------------
// Read — real-time subscription
// ---------------------------------------------------------------------------

/**
 * Subscribe to a user's recent activity feed in real time.
 *
 * Firestore path: `users/{uid}/activity`
 *
 * Results are ordered newest-first and capped at `maxResults`.
 * Activity is already user-scoped by path so no tenant filter is needed.
 */
export function subscribeToUserActivity(
  uid: string,
  onData: (items: ActivityItem[]) => void,
  onError?: (err: Error) => void,
  maxResults = 20,
): Unsubscribe {
  const ref = collection(db, "users", uid, "activity")
  const q = query(ref, orderBy("timestamp", "desc"), fbLimit(maxResults))

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) =>
        docToItem(d.id, d.data() as ActivityDoc),
      )
      onData(items)
    },
    (err) => {
      console.error("[ActivityService] Listener error:", err)
      onError?.(err)
    },
  )
}

// ---------------------------------------------------------------------------
// Write — record a new event
// ---------------------------------------------------------------------------

/**
 * Record a new activity event for the given user.
 *
 * Call this from API routes or other services after meaningful events:
 * booking creation, status changes, profile saves, etc.
 *
 * Example (Pages API route):
 * ```ts
 * await recordActivity(uid, {
 *   type: "booking_created",
 *   title: "Booking submitted",
 *   description: `${tourTitle} — ${dateRange}`,
 *   link: "/dashboard/bookings",
 *   tenantId,
 * })
 * ```
 */
export async function recordActivity(
  uid: string,
  event: Omit<ActivityItem, "id" | "timestamp">,
): Promise<string> {
  const ref = collection(db, "users", uid, "activity")
  const docRef = await addDoc(ref, {
    type: event.type,
    title: event.title,
    description: event.description,
    link: event.link ?? null,
    tenantId: event.tenantId ?? null,
    timestamp: serverTimestamp(),
  })
  return docRef.id
}
