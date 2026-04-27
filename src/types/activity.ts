// ---------------------------------------------------------------------------
// ActivityItem — user activity feed event stored in Firestore
// Path: users/{uid}/activity/{activityId}
// ---------------------------------------------------------------------------

export type ActivityEventType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_completed"
  | "booking_cancelled"
  | "diamond_saved"
  | "message_received"
  | "profile_updated"

export interface ActivityItem {
  id: string
  type: ActivityEventType
  title: string
  description: string
  /** ISO string on the wire; Date after deserialization. */
  timestamp: Date
  link?: string
  /** Tenant this event belongs to — used for scoping. */
  tenantId?: string
}
