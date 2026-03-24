"use client"

import { useState, useEffect, useCallback } from "react"
import { subscribeToMessages, sendMessage } from "@/lib/firebase/chat"
import type { ChatMessage } from "@/types/chat"

export function useChat(roomId: string | null, senderUid: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId || !senderUid) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeToMessages(roomId, senderUid, (msgs) => {
      setMessages(msgs)
      setLoading(false)
    })

    return unsub
  }, [roomId, senderUid])

  const send = useCallback(
    async (text: string) => {
      if (!roomId || !senderUid) return
      await sendMessage(roomId, senderUid, "client", text)
    },
    [roomId, senderUid],
  )

  return { messages, loading, send }
}
