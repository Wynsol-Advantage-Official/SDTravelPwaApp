"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils/format"
import { useChat } from "@/hooks/useChat"
import { ChatBubble } from "@/components/dashboard/ChatBubble"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<BookingStatus, string> = {
  hold: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-sand-50 text-sand-600 border-sand-200",
  awaiting_payment: "bg-purple-100 text-purple-800 border-purple-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-ocean-50 text-ocean border-ocean-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

const STATUS_ICON: Record<BookingStatus, string> = {
  hold: "◇",
  pending: "◈",
  awaiting_payment: "⧫",
  confirmed: "✓",
  completed: "★",
  cancelled: "✕",
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  hold: "Hold",
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_ACTIONS: Record<
  string,
  { label: string; to: BookingStatus; style: string }[]
> = {
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

function getTourGradient(title: string): string {
  const t = title.toLowerCase()
  if (t.includes("sahara") || t.includes("desert"))
    return "from-amber-600 via-orange-700 to-red-800"
  if (t.includes("cockpit") || t.includes("country") || t.includes("jungle"))
    return "from-emerald-500 via-green-700 to-teal-800"
  if (t.includes("ocean") || t.includes("beach") || t.includes("coast"))
    return "from-sky-500 via-blue-600 to-indigo-800"
  if (t.includes("mountain") || t.includes("peak"))
    return "from-slate-500 via-gray-700 to-zinc-800"
  return "from-sand via-gold to-sand-600"
}

function getInitials(name?: string, uid?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  return (uid ?? "?").slice(0, 2).toUpperCase()
}

function formatTimestamp(value: unknown): string {
  if (!value) return "—"
  const d = new Date(value as string | number)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BookingDetailModalProps {
  booking: EnrichedBooking
  agentUid: string
  updating: boolean
  onClose: () => void
  onUpdateStatus: (id: string, status: BookingStatus) => void
}

export function BookingDetailModal({
  booking,
  agentUid,
  updating,
  onClose,
  onUpdateStatus,
}: BookingDetailModalProps) {
  const actions = STATUS_ACTIONS[booking.status] ?? []
  const initials = getInitials(booking.userName, booking.uid)
  const chatRoomId = `booking_${booking._id}`
  const [pendingAction, setPendingAction] = useState<{ label: string; to: BookingStatus } | null>(null)

  // Chat — agent uses "agent" role
  const { messages, loading: chatLoading, send: chatSendRaw } = useChat(chatRoomId, agentUid)
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Override send to use "agent" role
  const sendAgentMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !agentUid) return
      const { sendMessage } = await import("@/lib/firebase/chat")
      await sendMessage(chatRoomId, agentUid, "agent", text)
    },
    [chatRoomId, agentUid],
  )

  const handleSend = useCallback(async () => {
    if (!chatInput.trim()) return
    const text = chatInput
    setChatInput("")
    await sendAgentMessage(text)
  }, [chatInput, sendAgentMessage])

  // Auto-scroll chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const detailRows: { label: string; value: string }[] = [
    { label: "Full Name", value: booking.userName ?? "—" },
    { label: "Email", value: booking.userEmail ?? "—" },
    { label: "Phone", value: booking.userPhone ?? "—" },
    { label: "Location", value: booking.userCountry ?? "—" },
    { label: "Guests (Pax)", value: booking.guests != null ? `${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}` : "—" },
    { label: "Source", value: booking.dataSource ?? "—" },
    { label: "Tour Date", value: booking.tourDate ?? "—" },
    { label: "Booking ID", value: booking._id },
    { label: "Created", value: formatTimestamp(booking.createdAt) },
    { label: "Updated", value: formatTimestamp(booking.updatedAt) },
  ]

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="fixed inset-4 z-50 mx-auto my-auto flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-8 lg:flex-row"
      >
        {/* ── Left Column: Details ──────────────────────────────────────── */}
        <div className="relative flex w-full flex-col overflow-y-auto border-b border-charcoal/5 lg:w-1/2 lg:border-b-0 lg:border-r">
          {/* Tour hero */}
          <div className="relative h-44 w-full shrink-0 overflow-hidden">
            {booking.tourHeroImage ? (
              <img
                src={booking.tourHeroImage}
                alt={booking.tourTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`h-full w-full bg-linear-to-br ${getTourGradient(booking.tourTitle)}`}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0zMHY2aC02VjRoNnptMCAzMFY0MGgtNnYtNmg2ek0xMiAxNHY2SDZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-60" />
              </div>
            )}
            {/* Gradient overlay for text */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-5 pb-4 pt-10">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${STATUS_BADGE[booking.status]}`}
                >
                  {STATUS_ICON[booking.status]} {STATUS_LABEL[booking.status]}
                </span>
              </div>
              <h2 className="mt-1 font-serif text-xl font-bold text-white drop-shadow">
                {booking.tourTitle}
              </h2>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* User summary + avatar */}
          <div className="flex items-center gap-3 border-b border-charcoal/5 px-5 py-4">
            {booking.userAvatar ? (
              <img
                src={booking.userAvatar}
                alt={booking.userName ?? "User"}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/40"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gold to-sand text-sm font-bold text-white ring-2 ring-gold/40">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal">
                {booking.userName ?? "Unknown User"}
              </p>
              <p className="truncate text-xs text-charcoal/50">
                {booking.userEmail ?? booking.uid}
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="font-serif text-lg font-bold text-charcoal">
                {formatPrice(booking.totalPrice, booking.currency)}
              </div>
              {booking.userSubmittedPrice != null &&
                booking.userSubmittedPrice !== booking.totalPrice && (
                  <p className="text-[10px] text-amber-600">
                    Submitted: {formatPrice(booking.userSubmittedPrice, booking.currency)}
                  </p>
                )}
            </div>
          </div>

          {/* Detail list */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal/40">
              Booking Details
            </h3>
            <dl className="space-y-2.5">
              {detailRows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-xs font-medium text-charcoal/50">
                    {label}
                  </dt>
                  <dd className="text-right text-xs font-medium text-charcoal break-all">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Action buttons */}
            {actions.length > 0 && (
              <div className="mt-6 border-t border-charcoal/5 pt-4">
                <div className="flex flex-wrap gap-2">
                  {actions.map(({ label, to, style }) => (
                    <button
                      key={to}
                      disabled={updating}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingAction({ label, to })
                      }}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition-opacity disabled:opacity-50 ${style}`}
                    >
                      {updating ? "…" : label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {pendingAction && (
                    <motion.div
                      key="detail-confirm"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 z-40 flex items-center justify-center p-5"
                    >
                      <div className="absolute inset-0 rounded-l-2xl bg-black/20 backdrop-blur-sm" />
                      <div className="relative w-full max-w-md rounded-2xl bg-white/95 p-4 shadow-2xl">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 text-sm text-charcoal">
                            Confirm <span className="font-semibold">{pendingAction.label}</span>?
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setPendingAction(null)
                              }}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!pendingAction) return
                                onUpdateStatus(booking._id, pendingAction.to)
                                setPendingAction(null)
                              }}
                              disabled={updating}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              {updating ? "…" : "Confirm"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Link to full booking detail page */}
          <div className="shrink-0 border-t border-charcoal/5 px-5 py-3">
            <a
              href={`/my-bookings/${booking._id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-ocean hover:text-ocean/80 transition-colors"
            >
              View Full Booking Page
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Right Column: Booking Chat ───────────────────────────────── */}
        <div className="flex w-full flex-col lg:w-1/2">
          {/* Chat header */}
          <div className="shrink-0 border-b border-charcoal/5 px-5 py-3">
            <h3 className="text-sm font-semibold text-charcoal">Booking Chat</h3>
            <p className="text-[11px] text-charcoal/40">
              Messages between Traveler &amp; Concierge
            </p>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {chatLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                  <p className="text-xs text-charcoal/40">Loading chat…</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-2xl text-charcoal/15">💬</div>
                  <p className="text-xs text-charcoal/40">
                    No messages yet. Start the conversation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg._id}>
                    {/* Role label */}
                    <p
                      className={`mb-0.5 text-[10px] font-semibold ${
                        msg.senderRole === "agent"
                          ? "text-right text-gold-600"
                          : "text-charcoal/40"
                      }`}
                    >
                      {msg.senderRole === "agent" ? "Concierge" : "Traveler"}
                    </p>
                    <ChatBubble
                      message={msg}
                      isOwn={msg.senderUid === agentUid}
                    />
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="shrink-0 border-t border-charcoal/5 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                className="flex-1 rounded-xl border border-charcoal/10 bg-diamond px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-white transition-colors hover:bg-gold-500 disabled:bg-charcoal/10 disabled:text-charcoal/30"
                aria-label="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
