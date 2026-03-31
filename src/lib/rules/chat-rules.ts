import type { ChatRoom } from "@/types/chat"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum allowed message length in characters. */
export const MAX_MESSAGE_LENGTH = 2_000

/** Human-readable labels for each room status. */
export const ROOM_STATUS_LABEL: Record<ChatRoom["status"], string> = {
  active: "Active",
  resolved: "Resolved",
  archived: "Archived",
}

export interface RoomStatusAction {
  label: string
  to: ChatRoom["status"]
  style: string
}

/** Available status transitions for each room status (agent-side). */
export const ROOM_STATUS_ACTIONS: Record<ChatRoom["status"], RoomStatusAction[]> = {
  active: [
    {
      label: "Resolve",
      to: "resolved",
      style: "bg-green-600 hover:bg-green-700 text-white",
    },
    {
      label: "Archive",
      to: "archived",
      style: "bg-charcoal/60 hover:bg-charcoal/80 text-white",
    },
  ],
  resolved: [
    {
      label: "Re-open",
      to: "active",
      style: "bg-ocean hover:bg-ocean/90 text-white",
    },
    {
      label: "Archive",
      to: "archived",
      style: "bg-charcoal/60 hover:bg-charcoal/80 text-white",
    },
  ],
  archived: [
    {
      label: "Re-open",
      to: "active",
      style: "bg-ocean hover:bg-ocean/90 text-white",
    },
  ],
}

// ---------------------------------------------------------------------------
// Pure validation functions
// ---------------------------------------------------------------------------

/**
 * Returns true if the message text is non-empty and within the allowed length.
 */
export function isChatMessageValid(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH
}

/**
 * Returns true if the given user is allowed to send messages to this room.
 * Archived rooms are closed — no new messages allowed from either side.
 */
export function canUserSendToRoom(
  room: Pick<ChatRoom, "status" | "clientUid">,
  senderUid: string,
): boolean {
  if (room.status === "archived") return false
  // Both the client and any agent can message an active or resolved room
  return !!senderUid
}

/**
 * Returns true if this room can be resolved (must be active).
 */
export function canResolveRoom(room: Pick<ChatRoom, "status">): boolean {
  return room.status === "active"
}

/**
 * Returns true if this room can be archived (must not already be archived).
 */
export function canArchiveRoom(room: Pick<ChatRoom, "status">): boolean {
  return room.status !== "archived"
}

/**
 * Returns the valid next status actions for a given room status.
 */
export function getRoomStatusActions(
  status: ChatRoom["status"],
): RoomStatusAction[] {
  return ROOM_STATUS_ACTIONS[status] ?? []
}
