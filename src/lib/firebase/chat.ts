import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./client"
import type { ChatMessage } from "@/types/chat"

/**
 * Ensure the chat room document exists. Creates it with merge so existing
 * data is never overwritten if the room was already initialised by an agent.
 * Exported so callers can await room creation before subscribing to messages.
 */
export async function ensureRoomExists(roomId: string, clientUid: string): Promise<void> {
  const roomRef = doc(db, "chatRooms", roomId)
  await setDoc(
    roomRef,
    { clientUid, createdAt: serverTimestamp(), status: "open" },
    { merge: true },
  )
}

/**
 * Subscribe to real-time chat messages for a room.
 */
export function subscribeToMessages(
  roomId: string,
  clientUid: string,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const messagesRef = collection(db, "chatRooms", roomId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "asc"))

  return onSnapshot(q, (snap) => {
    const messages: ChatMessage[] = snap.docs.map((d) => ({
      _id: d.id,
      ...(d.data() as Omit<ChatMessage, "_id">),
    }))
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
