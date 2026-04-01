import type { BookingStatus } from "@/types/booking"

export interface StatusAction {
  label: string
  to: BookingStatus
  style: string
}

export const STATUS_ACTIONS: Record<string, StatusAction[]> = {
  hold: [
    { label: "Approve", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Awaiting Payment", to: "awaiting_payment", style: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Decline", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  pending: [
    { label: "Confirm", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Awaiting Payment", to: "awaiting_payment", style: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  awaiting_payment: [
    { label: "Confirm Payment", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  confirmed: [
    { label: "Complete", to: "completed", style: "bg-ocean hover:bg-ocean/90 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
}

export const STATUS_BADGE: Record<BookingStatus, string> = {
  hold: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-tan-50 text-tan-600 border-tan-200",
  awaiting_payment: "bg-purple-100 text-purple-800 border-purple-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-ocean-50 text-ocean border-ocean-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

export const STATUS_ICON: Record<BookingStatus, string> = {
  hold: "◇",
  pending: "◈",
  awaiting_payment: "⧫",
  confirmed: "✓",
  completed: "★",
  cancelled: "✕",
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  hold: "Hold",
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

/**
 * Returns true if the status transition is allowed.
 */
export function canTransition(
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  const allowed = STATUS_ACTIONS[from]
  if (!allowed) return false
  return allowed.some((a) => a.to === to)
}

/**
 * Returns the list of valid next actions for a given status.
 */
export function getAvailableActions(status: BookingStatus): StatusAction[] {
  return STATUS_ACTIONS[status] ?? []
}
