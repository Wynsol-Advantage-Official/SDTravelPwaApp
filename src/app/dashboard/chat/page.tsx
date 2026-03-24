"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { useChat } from "@/hooks/useChat"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { ChatBubble } from "@/components/dashboard/ChatBubble"
import { mockChatMessages, mockUser } from "@/mocks"
import type { ChatMessage } from "@/types/chat"

export default function ChatPage() {
  return (
    <AuthGuard fallbackMessage="Sign in to chat with your dedicated Diamond concierge.">
      <ChatContent />
    </AuthGuard>
  )
}

function ChatContent() {
  const { user } = useAuth()
  const { isMockMode } = useMockMode()

  // For now, use a single room derived from the user's UID.
  const roomId = isMockMode
    ? `room_${mockUser.uid}`
    : user
      ? `room_${user.uid}`
      : null
  const {
    messages: liveMessages,
    loading: liveLoading,
    send: liveSend,
  } = useChat(isMockMode ? null : roomId, isMockMode ? null : (user?.uid ?? null))

  const [mockMessages, setMockMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = isMockMode ? mockMessages : liveMessages
  const loading = isMockMode ? false : liveLoading
  const currentUid = isMockMode ? mockUser.uid : user?.uid

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text) return
    setDraft("")

    if (isMockMode) {
      // Add a mock client message, then simulate a concierge reply
      const clientMsg: ChatMessage = {
        _id: `mock-${Date.now()}`,
        senderUid: mockUser.uid,
        senderRole: "client",
        text,
        timestamp: new Date(),
        read: true,
      }
      setMockMessages((prev) => [...prev, clientMsg])

      setTimeout(() => {
        const agentMsg: ChatMessage = {
          _id: `mock-agent-${Date.now()}`,
          senderUid: "agent-concierge-001",
          senderRole: "agent",
          text: "Thank you for your message! Your dedicated Diamond concierge will respond shortly. In the meantime, feel free to browse our latest tours.",
          timestamp: new Date(),
          read: false,
        }
        setMockMessages((prev) => [...prev, agentMsg])
      }, 1500)
    } else {
      await liveSend(text)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-14rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-charcoal">
          Concierge Chat
        </h1>
        <span className="text-xs text-charcoal/40">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-sm border border-sand/20 bg-white p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <p className="text-sm text-charcoal/40">Loading messages…</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <div className="mb-3 text-3xl text-gold/30">◇</div>
              <p className="text-sm text-charcoal/50">
                Start the conversation — your Diamond concierge is standing by.
              </p>
              <p className="mt-1 text-xs text-charcoal/30">
                Ask about tours, custom itineraries, or special requests.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderUid === currentUid}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="mt-3 flex gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
          className="flex-1 rounded-sm border border-sand/30 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:ring-1 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-sm bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:bg-gold-400 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
