"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ensureRoomExists,
  subscribeToMessages,
  sendMessage,
} from "@/lib/services/chat.service"
import type { ChatMessage } from "@/types/chat"

export function useChat(
  roomId: string | null,
  senderUid: string | null,
  options?: { tourId?: string; tourSlug?: string },
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  const tourId = options?.tourId
  const tourSlug = options?.tourSlug

  useEffect(() => {
    if (!roomId || !senderUid) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    let cancelled = false
    let unsubscribe: (() => void) | null = null

    // Ensure room doc exists before subscribing so it appears in the agent inbox
    ensureRoomExists(roomId, senderUid, { tourId, tourSlug })
      .then(() => {
        if (cancelled) return
        unsubscribe = subscribeToMessages(roomId, senderUid, (msgs) => {
          setMessages(msgs)
          setLoading(false)
        })
      })
      .catch((err) => {
        console.error("[useChat] Room init failed:", err)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [roomId, senderUid, tourId, tourSlug])

  const send = useCallback(
    async (text: string) => {
      if (!roomId || !senderUid) return
      await sendMessage(roomId, senderUid, "client", text)
    },
    [roomId, senderUid],
  )

  return { messages, loading, send }
}
