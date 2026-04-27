/**
 * Server-side activity recorder — uses Firebase Admin SDK.
 *
 * Equivalent of `recordActivity` from `activity.service.ts` but safe to call
 * from Pages API routes (`src/pages/api/`) which run in Node.js and must use
 * the Admin SDK rather than the client SDK.
 *
 * Writes to: `users/{uid}/activity/{auto-id}`
 */
import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import type { ActivityEventType } from "@/types/activity"

export interface RecordActivityInput {
  type: ActivityEventType
  title: string
  description: string
  link?: string
  tenantId?: string
}

/**
 * Record an activity event for a user. Fire-and-forget — errors are logged
 * but never thrown so a failure here never breaks the primary operation.
 */
export async function recordActivityAdmin(
  uid: string,
  event: RecordActivityInput,
): Promise<void> {
  try {
    await adminDb.collection("users").doc(uid).collection("activity").add({
      type: event.type,
      title: event.title,
      description: event.description,
      link: event.link ?? null,
      tenantId: event.tenantId ?? null,
      timestamp: FieldValue.serverTimestamp(),
    })
  } catch (err) {
    // Never propagate — activity is supplemental, not critical
    console.error("[ActivityAdmin] Failed to record activity:", err)
  }
}
