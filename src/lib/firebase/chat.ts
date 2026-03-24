import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  limit,
  where,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./client"
import type { ChatMessage, ChatRoom } from "@/types/chat"

/** Safely convert Firestore Timestamp | Date | unknown → JS Date */
function toDate(val: unknown): Date {
  if (val && typeof val === "object" && "toDate" in val) {
    return (val as { toDate(): Date }).toDate()
  }
  if (val instanceof Date) return val
  return new Date((val as string | number) ?? 0)
}

/** Map legacy "open" status → "active" */
function normaliseStatus(raw: string | undefined): ChatRoom["status"] {
  if (raw === "resolved") return "resolved"
  if (raw === "archived") return "archived"
  return "active"
}

/**
 * Ensure the chat room document exists. Creates it with merge so existing
 * data is never overwritten if the room was already initialised by an agent.
 * Exported so callers can await room creation before subscribing to messages.
 */
export async function ensureRoomExists(
  roomId: string,
  clientUid: string,
  options?: { tourId?: string; tourSlug?: string },
): Promise<void> {
  const roomRef = doc(db, "chatRooms", roomId)
  const data: Record<string, unknown> = {
    clientUid,
    createdAt: serverTimestamp(),
    status: "active",
  }
  if (options?.tourId) data.tourId = options.tourId
  if (options?.tourSlug) data.tourSlug = options.tourSlug
  await setDoc(roomRef, data, { merge: true })
}

/**
 * Subscribe to real-time chat messages for a room.
 */
export function subscribeToMessages(
  roomId: string,
  _clientUid: string,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const messagesRef = collection(db, "chatRooms", roomId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "asc"))

  return onSnapshot(q, (snap) => {
    const messages: ChatMessage[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        _id: d.id,
        senderUid: data.senderUid ?? "",
        senderRole: data.senderRole ?? "client",
        text: data.text ?? "",
        timestamp: toDate(data.timestamp),
        read: data.read ?? false,
      }
    })
    callback(messages)
  })
}

/**
 * Send a message to a chat room.
 */
export async function sendMessage(
  roomId: string,
  senderUid: string,
  senderRole: "client" | "agent",
  text: string,
): Promise<void> {
  const sanitized = text.trim().slice(0, 2000)
  if (!sanitized) return

  const messagesRef = collection(db, "chatRooms", roomId, "messages")
  await addDoc(messagesRef, {
    senderUid,
    senderRole,
    text: sanitized,
    timestamp: serverTimestamp(),
    read: false,
  })

  // Update lastMessageAt on room metadata
  const roomRef = doc(db, "chatRooms", roomId)
  await updateDoc(roomRef, { lastMessageAt: serverTimestamp() })
}

/**
 * Mark all unread messages in a room as read for a given user.
 */
export async function markMessagesRead(
  roomId: string,
  readerUid: string,
): Promise<void> {
  const messagesRef = collection(db, "chatRooms", roomId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "asc"))

  // One-time read
  const { getDocs } = await import("firebase/firestore")
  const snap = await getDocs(q)

  const batch = (await import("firebase/firestore")).writeBatch(db)
  snap.docs.forEach((d) => {
    const data = d.data()
    if (!data.read && data.senderUid !== readerUid) {
      batch.update(d.ref, { read: true })
    }
  })
  await batch.commit()
}

/**
 * Subscribe to all chat rooms ordered by last activity (agent inbox).
 * Optionally filter by status.
 */
export function subscribeToAllRooms(
  callback: (rooms: ChatRoom[]) => void,
  statusFilter?: ChatRoom["status"],
): Unsubscribe {
  const roomsRef = collection(db, "chatRooms")
  // For "active" filter also match legacy "open" status.
  const q = statusFilter
    ? query(
        roomsRef,
        statusFilter === "active"
          ? where("status", "in", ["active", "open"])
          : where("status", "==", statusFilter),
        limit(100),
      )
    : query(roomsRef, limit(100))

  return onSnapshot(q, (snap) => {
    const rooms: ChatRoom[] = snap.docs
      .filter((d) => d.data().clientUid) // skip phantom / empty-shell docs
      .map((d) => {
        const data = d.data()
        return {
          _id: d.id,
          clientUid: data.clientUid ?? "",
          agentUid: data.agentUid ?? "",
          tourId: data.tourId,
          tourSlug: data.tourSlug,
          status: normaliseStatus(data.status),
          createdAt: toDate(data.createdAt),
          lastMessageAt: toDate(data.lastMessageAt ?? data.createdAt),
        }
      })
    rooms.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
    callback(rooms)
  })
}

/**
 * Subscribe to the latest message of a room (for inbox preview).
 */
export function subscribeToLatestMessage(
  roomId: string,
  callback: (message: ChatMessage | null) => void,
): Unsubscribe {
  const messagesRef = collection(db, "chatRooms", roomId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1))

  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null)
      return
    }
    const d = snap.docs[0]
    const data = d.data()
    callback({
      _id: d.id,
      senderUid: data.senderUid ?? "",
      senderRole: data.senderRole ?? "client",
      text: data.text ?? "",
      timestamp: toDate(data.timestamp),
      read: data.read ?? false,
    })
  })
}

/**
 * Update the status of a chat room (e.g. resolve, archive).
 */
export async function updateRoomStatus(
  roomId: string,
  status: ChatRoom["status"],
): Promise<void> {
  const roomRef = doc(db, "chatRooms", roomId)
  await updateDoc(roomRef, { status })
}

/**
 * Fetch a user's display name from the users profile subcollection.
 * Cross-references clientUid via users -> profile -> main.
 */
export async function getClientDisplayName(uid: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, "users", uid, "profile", "main"))
    if (snap.exists()) {
      const data = snap.data()
      return data.displayName || data.email || uid
    }
  } catch {
    // Firestore read failed — fall back to UID
  }
  return uid
}
