/**
 * Chat Service
 *
 * Orchestrates all chat operations. Hooks and the agent inbox should import
 * from here — never directly from `src/lib/firebase/chat`.
 *
 * Wraps firebase/chat so the Firebase coupling stays inside `src/lib/`.
 */
import type { Unsubscribe } from "firebase/firestore"
import {
  ensureRoomExists as _ensureRoomExists,
  subscribeToMessages as _subscribeToMessages,
  sendMessage as _sendMessage,
  markMessagesRead as _markMessagesRead,
  subscribeToAllRooms as _subscribeToAllRooms,
  subscribeToLatestMessage as _subscribeToLatestMessage,
  updateRoomStatus as _updateRoomStatus,
  getClientDisplayName as _getClientDisplayName,
  getClientProfile as _getClientProfile,
} from "@/lib/firebase/chat"
import { isChatMessageValid } from "@/lib/rules/chat-rules"
import type { ChatMessage, ChatRoom } from "@/types/chat"

// ---------------------------------------------------------------------------
// Room lifecycle
// ---------------------------------------------------------------------------

/**
 * Ensure the chat room document exists in Firestore before subscribing.
 * Creates with merge so existing agent-created data is preserved.
 */
export async function ensureRoomExists(
  roomId: string,
  clientUid: string,
  options?: { tourId?: string; tourSlug?: string },
): Promise<void> {
  return _ensureRoomExists(roomId, clientUid, options)
}

/**
 * Update the status of a chat room (resolve → archive → re-open).
 */
export async function updateRoomStatus(
  roomId: string,
  status: ChatRoom["status"],
): Promise<void> {
  return _updateRoomStatus(roomId, status)
}

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

/**
 * Send a message to a room after validating the text.
 * Rejects silently if the text is empty or exceeds the length limit so callers
 * do not need to guard before calling.
 */
export async function sendMessage(
  roomId: string,
  senderUid: string,
  senderRole: "client" | "agent",
  text: string,
): Promise<void> {
  if (!isChatMessageValid(text)) return
  return _sendMessage(roomId, senderUid, senderRole, text)
}

/**
 * Mark all messages in a room as read for the given reader.
 */
export async function markMessagesRead(
  roomId: string,
  readerUid: string,
): Promise<void> {
  return _markMessagesRead(roomId, readerUid)
}

// ---------------------------------------------------------------------------
// Real-time subscriptions
// ---------------------------------------------------------------------------

/**
 * Subscribe to real-time messages for a specific room.
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  roomId: string,
  clientUid: string,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe {
  return _subscribeToMessages(roomId, clientUid, callback)
}

/**
 * Subscribe to all chat rooms ordered by last activity (agent inbox).
 * Optionally filter by room status.
 */
export function subscribeToAllRooms(
  callback: (rooms: ChatRoom[]) => void,
  statusFilter?: ChatRoom["status"],
): Unsubscribe {
  return _subscribeToAllRooms(callback, statusFilter)
}

/**
 * Subscribe to the latest message of a room (for inbox preview).
 */
export function subscribeToLatestMessage(
  roomId: string,
  callback: (message: ChatMessage | null) => void,
): Unsubscribe {
  return _subscribeToLatestMessage(roomId, callback)
}

// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------

/**
 * Fetch the display name for a given client UID.
 * Falls back to the raw UID if the profile document does not exist.
 */
export async function getClientDisplayName(uid: string): Promise<string> {
  return _getClientDisplayName(uid)
}

/**
 * Fetch the full profile summary for a given client UID.
 */
export async function getClientProfile(
  uid: string,
): Promise<{ displayName: string; email?: string; phone?: string; avatar?: string }> {
  return _getClientProfile(uid)
}

// ---------------------------------------------------------------------------
// Combined operations
// ---------------------------------------------------------------------------

/**
 * Ensure a room exists, then subscribe to its messages in one call.
 * Returns an unsubscribe function (or no-op if init fails).
 * Preferred over calling ensureRoomExists + subscribeToMessages separately.
 */
export async function initAndSubscribeToRoom(
  roomId: string,
  clientUid: string,
  options: { tourId?: string; tourSlug?: string } | undefined,
  onMessages: (messages: ChatMessage[]) => void,
  onReady?: () => void,
): Promise<Unsubscribe> {
  await ensureRoomExists(roomId, clientUid, options)
  onReady?.()
  return subscribeToMessages(roomId, clientUid, onMessages)
}
