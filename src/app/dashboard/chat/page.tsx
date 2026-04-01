"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()

  // Optional tour context from query params (e.g. ?tourId=xxx&tourSlug=yyy)
  const tourId = searchParams?.get("tourId") ?? undefined
  const tourSlug = searchParams?.get("tourSlug") ?? undefined

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
  } = useChat(
    isMockMode ? null : roomId,
    isMockMode ? null : (user?.uid ?? null),
    { tourId, tourSlug },
  )

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
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ── Native-style header ──────────────────────── */}
      <div className="flex items-center gap-3 border-b border-charcoal/5 bg-white px-4 py-3 md:rounded-t-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-bold text-charcoal">
          SD
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-charcoal">
            Diamond Concierge
          </p>
          <p className="text-[11px] text-charcoal/40">
            {tourSlug
              ? tourSlug.replace(/-/g, " ")
              : "We typically reply within a few hours"}
          </p>
        </div>
        <span className="rounded-full bg-charcoal/5 px-2 py-0.5 text-[10px] text-charcoal/40">
          {messages.length} msg{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Messages ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-[#f8f7f4] px-3 py-4 md:px-4">
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
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                <svg className="h-7 w-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-charcoal/60">
                Start the conversation
              </p>
              <p className="mt-1 text-xs text-charcoal/30">
                Ask about tours, custom itineraries, or special requests.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {messages.map((msg) => (
              <ChatBubble
                key={msg._id}
                message={msg}
                isOwn={msg.senderUid === currentUid}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Native-style input area ──────────────────── */}
      <div className="border-t border-charcoal/5 bg-white px-3 py-2 md:rounded-b-2xl" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              maxLength={2000}
              className="w-full rounded-full border border-charcoal/10 bg-charcoal/2 px-4 py-2.5 pr-4 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-charcoal transition-all hover:bg-gold/90 active:scale-95 disabled:opacity-40"
            aria-label="Send message"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
