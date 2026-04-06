"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useTenant } from "@/hooks/useTenant"
import { ChatBubble } from "@/components/dashboard/ChatBubble"
import { ensureRoomExists, subscribeToMessages, sendMessage, markMessagesRead } from "@/lib/services/chat.service"
import type { ChatMessage } from "@/types/chat"

interface BookingChatPanelProps {
  bookingId: string
  tourId?: string
  tourSlug?: string
}

export function BookingChatPanel({ bookingId, tourId, tourSlug }: BookingChatPanelProps) {
  const { user } = useAuth()
  const { tenantId } = useTenant()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const roomId = `booking_${bookingId}`
  const uid = user?.uid ?? null

  // Subscribe to messages — await room creation first to avoid permission errors
  // when the Firestore rule tries get(chatRoom).data.clientUid on a non-existent doc.
  useEffect(() => {
    if (!uid || !roomId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    let cancelled = false
    let unsubscribe: (() => void) | null = null

    ensureRoomExists(roomId, uid, { tourId, tourSlug, tenantId })
      .then(() => {
        if (cancelled) return
        unsubscribe = subscribeToMessages(roomId, uid, (msgs) => {
          setMessages(msgs)
          setLoading(false)
        })
      })
      .catch((err) => {
        console.error("[Chat] Room init failed:", err)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [uid, roomId])

  // Mark messages read when panel is open
  useEffect(() => {
    if (isOpen && uid && roomId && messages.length > 0) {
      markMessagesRead(roomId, uid).catch(() => {
        // silent — may fail if no unread messages
      })
    }
  }, [isOpen, uid, roomId, messages.length])

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !uid || sending) return

    setSending(true)
    setInput("")
    try {
      await sendMessage(roomId, uid, "client", text)
    } catch (err) {
      console.error("[Chat] Send failed:", err)
      setInput(text) // Restore on failure
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }, [input, uid, roomId, sending])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const unreadCount = messages.filter((m) => !m.read && m.senderUid !== uid).length

  if (!user) return null

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ocean shadow-lg transition-transform active:scale-95 hover:scale-105"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        {isOpen ? (
          <svg className="h-6 w-6 text-ocean-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="h-6 w-6 text-ocean-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel — full screen on mobile, floating on desktop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white sm:inset-auto sm:bottom-24 sm:right-6 sm:h-120 sm:w-90 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-ocean-deep/10 sm:shadow-2xl md:h-128 md:w-100">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-khaki/30 bg-white px-4 py-3 dark:border-ocean-deep/5 dark:bg-ocean-deep">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-ocean-deep/60 transition-colors hover:text-ocean-deep dark:text-ocean-deep/60 dark:hover:text-white sm:hidden"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-xs font-bold text-ocean-deep">
              SD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ocean-deep dark:text-white">Concierge Chat</p>
              <p className="truncate text-[10px] text-ocean-deep/50 dark:text-white/50">
                {tourSlug
                  ? tourSlug.replace(/-/g, " ")
                  : "We typically reply within a few hours"}
              </p>
            </div>
            {tourId && (
              <span className="hidden shrink-0 rounded bg-ocean/20 px-1.5 py-0.5 text-[9px] font-medium text-ocean sm:inline-block">
                Tour linked
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-contain bg-tan px-3 py-3">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean/10">
                  <svg className="h-6 w-6 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-ocean-deep/60">
                  Ask about your booking
                </p>
                <p className="mt-1 text-xs text-ocean-deep/40">
                  Your concierge team is here to help
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg._id}
                    message={msg}
                    isOwn={msg.senderUid === uid}
                  />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-ocean-deep/5 bg-white px-3 py-2" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                maxLength={2000}
                disabled={sending}
                className="flex-1 rounded-full border border-ocean-deep/10 bg-ocean-deep/2 px-4 py-2.5 text-sm text-ocean-deep placeholder:text-ocean-deep/30 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean/30 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean text-ocean-deep transition-all hover:bg-ocean/90 active:scale-95 disabled:opacity-40"
                aria-label="Send message"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
