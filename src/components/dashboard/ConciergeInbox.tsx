"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useMockMode } from "@/hooks/useMockMode"
import { useAuth } from "@/hooks/useAuth"
import { ChatBubble } from "@/components/dashboard/ChatBubble"
import {
  subscribeToAllRooms,
  subscribeToMessages,
  subscribeToLatestMessage,
  sendMessage,
  markMessagesRead,
  updateRoomStatus,
  getClientDisplayName,
} from "@/lib/firebase/chat"
import {
  mockChatRooms,
  mockRoomMessages,
  mockClientNames,
} from "@/mocks"
import type { ChatRoom, ChatMessage } from "@/types/chat"
import {
  MessageSquare,
  CheckCircle2,
  Archive,
  ArrowLeft,
  Send,
  Circle,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Status filter config
// ---------------------------------------------------------------------------
const ROOM_FILTERS: { label: string; value: ChatRoom["status"] | "all"; icon: React.ReactNode }[] = [
  { label: "All", value: "all", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { label: "Active", value: "active", icon: <Circle className="h-3.5 w-3.5" /> },
  { label: "Resolved", value: "resolved", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { label: "Archived", value: "archived", icon: <Archive className="h-3.5 w-3.5" /> },
]

// ---------------------------------------------------------------------------
// Helper — relative time label
// ---------------------------------------------------------------------------
function timeAgo(date: Date): string {
  const d = date instanceof Date ? date : new Date(date as unknown as string)
  if (isNaN(d.getTime())) return ""
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

// ---------------------------------------------------------------------------
// ConciergeInbox — manages all chat channels for the agent
// ---------------------------------------------------------------------------
export function ConciergeInbox() {
  const { user } = useAuth()
  const { isMockMode } = useMockMode()
  const agentUid = user?.uid ?? ""

  // ── State ───────────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ChatRoom["status"] | "all">("all")
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  // ── Client display names (live mode) ────────────────────────────────────
  const [clientNames, setClientNames] = useState<Record<string, string>>({})
  const fetchedUidsRef = useRef<Set<string>>(new Set())

  // ── Latest message per room (for preview text in live mode) ─────────────
  const [latestMessages, setLatestMessages] = useState<Record<string, ChatMessage>>({})

  // ── Messages for selected room ──────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // ── Mock: unread counts per room ────────────────────────────────────────
  const [mockUnread, setMockUnread] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {}
    for (const [roomId, msgs] of Object.entries(mockRoomMessages)) {
      counts[roomId] = msgs.filter((m) => !m.read && m.senderRole === "client").length
    }
    return counts
  })

  // ── Subscribe to rooms ──────────────────────────────────────────────────
  useEffect(() => {
    if (isMockMode) {
      const filtered =
        statusFilter === "all"
          ? mockChatRooms
          : mockChatRooms.filter((r) => r.status === statusFilter)
      setRooms(filtered.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()))
      setRoomsLoading(false)
      return
    }

    setRoomsLoading(true)
    const filterVal = statusFilter === "all" ? undefined : statusFilter
    const unsub = subscribeToAllRooms((fetched) => {
      setRooms(fetched)
      setRoomsLoading(false)
    }, filterVal)

    return unsub
  }, [isMockMode, statusFilter])

  // ── Fetch client display names (live mode) ──────────────────────────────
  useEffect(() => {
    if (isMockMode || rooms.length === 0) return

    const unknownUids = rooms
      .map((r) => r.clientUid)
      .filter((uid) => uid && !fetchedUidsRef.current.has(uid))

    if (unknownUids.length === 0) return

    const unique = [...new Set(unknownUids)]
    unique.forEach((uid) => fetchedUidsRef.current.add(uid))

    let cancelled = false
    Promise.all(
      unique.map((uid) =>
        getClientDisplayName(uid).then((name) => [uid, name] as const),
      ),
    ).then((results) => {
      if (cancelled) return
      setClientNames((prev) => {
        const next = { ...prev }
        for (const [uid, name] of results) next[uid] = name
        return next
      })
    })

    return () => { cancelled = true }
  }, [rooms, isMockMode])

  // ── Subscribe to latest message per room (for preview) ──────────────────
  useEffect(() => {
    if (isMockMode || rooms.length === 0) return

    const unsubs = rooms.map((room) =>
      subscribeToLatestMessage(room._id, (msg) => {
        if (msg) {
          setLatestMessages((prev) => ({ ...prev, [room._id]: msg }))
        }
      }),
    )

    return () => unsubs.forEach((fn) => fn())
  }, [rooms, isMockMode])

  // ── Subscribe to messages for selected room ─────────────────────────────
  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([])
      return
    }

    if (isMockMode) {
      setMessages(mockRoomMessages[selectedRoomId] ?? [])
      setMessagesLoading(false)
      // Mark as read in mock
      setMockUnread((prev) => ({ ...prev, [selectedRoomId]: 0 }))
      return
    }

    setMessagesLoading(true)
    const unsub = subscribeToMessages(selectedRoomId, agentUid, (msgs) => {
      setMessages(msgs)
      setMessagesLoading(false)
    })

    // Mark messages read for the agent
    markMessagesRead(selectedRoomId, agentUid).catch(() => {})

    return unsub
  }, [selectedRoomId, isMockMode, agentUid])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  // ── Send handler ────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = draft.trim()
    if (!text || !selectedRoomId) return
    setDraft("")

    if (isMockMode) {
      const agentMsg: ChatMessage = {
        _id: `mock-agent-${Date.now()}`,
        senderUid: agentUid || "agent-concierge-001",
        senderRole: "agent",
        text,
        timestamp: new Date(),
        read: false,
      }
      setMessages((prev) => [...prev, agentMsg])
      return
    }

    await sendMessage(selectedRoomId, agentUid, "agent", text)
  }, [draft, selectedRoomId, isMockMode, agentUid])

  // ── Room status update ──────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    async (roomId: string, newStatus: ChatRoom["status"]) => {
      if (isMockMode) {
        setRooms((prev) =>
          prev.map((r) => (r._id === roomId ? { ...r, status: newStatus } : r)),
        )
        return
      }
      await updateRoomStatus(roomId, newStatus)
    },
    [isMockMode],
  )

  // ── Derived ─────────────────────────────────────────────────────────────
  const selectedRoom = rooms.find((r) => r._id === selectedRoomId) ?? null
  const totalUnread = isMockMode
    ? Object.values(mockUnread).reduce((a, b) => a + b, 0)
    : 0

  // ── Client display name ─────────────────────────────────────────────────
  function clientName(clientUid: string): string {
    if (isMockMode) return mockClientNames[clientUid] ?? clientUid
    return clientNames[clientUid] ?? clientUid.slice(0, 8) + "\u2026"
  }

  // Get last message text for room preview
  function lastMessagePreview(roomId: string): string {
    if (isMockMode) {
      const msgs = mockRoomMessages[roomId]
      if (!msgs?.length) return "No messages yet"
      return msgs[msgs.length - 1].text
    }
    const latest = latestMessages[roomId]
    if (latest) return latest.text
    return "Tap to view conversation"
  }

  function unreadCount(roomId: string): number {
    if (isMockMode) return mockUnread[roomId] ?? 0
    return 0
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100dvh-16rem)] overflow-hidden rounded-2xl border border-charcoal/5 bg-white shadow-sm">
      {/* ── Sidebar: Room List ─────────────────────────────────────────── */}
      <div
        className={[
          "flex w-full flex-col border-r border-charcoal/5 md:w-80 lg:w-96",
          selectedRoomId ? "hidden md:flex" : "flex",
        ].join(" ")}
      >
        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-charcoal/5 px-3 py-2">
          {ROOM_FILTERS.map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={[
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all",
                statusFilter === value
                  ? "bg-gold/10 text-gold"
                  : "text-charcoal/40 hover:bg-charcoal/5 hover:text-charcoal/70",
              ].join(" ")}
            >
              {icon}
              {label}
            </button>
          ))}
          {totalUnread > 0 && (
            <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-charcoal/15" />
                <p className="text-sm text-charcoal/40">No conversations yet</p>
              </div>
            </div>
          ) : (
            rooms.map((room) => {
              const unread = unreadCount(room._id)
              const isSelected = room._id === selectedRoomId
              return (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoomId(room._id)}
                  className={[
                    "flex w-full items-start gap-3 border-b border-charcoal/5 px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "bg-gold/5"
                      : "hover:bg-charcoal/2",
                  ].join(" ")}
                >
                  {/* Avatar circle */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-charcoal/10 text-sm font-bold text-charcoal/60">
                    {clientName(room.clientUid).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-semibold text-charcoal">
                        {clientName(room.clientUid)}
                      </span>
                      <span className="ml-2 shrink-0 text-[10px] text-charcoal/35">
                        {timeAgo(room.lastMessageAt)}
                      </span>
                    </div>
                    {(room.tourSlug || room.tourId) && (
                      <p className="truncate text-[11px] font-medium text-gold/70">
                        {room.tourSlug
                          ? room.tourSlug.replace(/-/g, " ")
                          : `Tour: ${room.tourId}`}
                      </p>
                    )}
                    <p className="mt-0.5 truncate text-xs text-charcoal/40">
                      {lastMessagePreview(room._id)}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Chat Panel ─────────────────────────────────────────────────── */}
      <div
        className={[
          "flex flex-1 flex-col",
          selectedRoomId ? "flex" : "hidden md:flex",
        ].join(" ")}
      >
        {selectedRoom ? (
          <>
            {/* Room header */}
            <div className="flex items-center gap-3 border-b border-charcoal/5 px-4 py-3">
              <button
                onClick={() => setSelectedRoomId(null)}
                className="rounded-lg p-1.5 text-charcoal/40 transition-colors hover:bg-charcoal/5 hover:text-charcoal md:hidden"
                aria-label="Back to inbox"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/10 text-sm font-bold text-charcoal/60">
                {clientName(selectedRoom.clientUid).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-charcoal">
                  {clientName(selectedRoom.clientUid)}
                </p>
                <p className="text-[11px] text-charcoal/40">
                  {selectedRoom.tourSlug
                    ? selectedRoom.tourSlug.replace(/-/g, " ")
                    : selectedRoom.tourId
                      ? `Tour: ${selectedRoom.tourId}`
                      : "General enquiry"}
                  {" · "}
                  <span
                    className={
                      selectedRoom.status === "active"
                        ? "text-green-600"
                        : selectedRoom.status === "resolved"
                          ? "text-blue-600"
                          : "text-charcoal/30"
                    }
                  >
                    {selectedRoom.status}
                  </span>
                </p>
              </div>
              {/* Status actions */}
              <div className="flex items-center gap-1">
                {selectedRoom.status === "active" && (
                  <button
                    onClick={() => handleStatusChange(selectedRoom._id, "resolved")}
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 transition-colors hover:bg-green-100"
                    title="Mark resolved"
                  >
                    <CheckCircle2 className="mr-1 inline h-3 w-3" />
                    Resolve
                  </button>
                )}
                {selectedRoom.status === "resolved" && (
                  <button
                    onClick={() => handleStatusChange(selectedRoom._id, "archived")}
                    className="rounded-lg border border-charcoal/10 bg-charcoal/5 px-3 py-1 text-[11px] font-semibold text-charcoal/60 transition-colors hover:bg-charcoal/10"
                    title="Archive"
                  >
                    <Archive className="mr-1 inline h-3 w-3" />
                    Archive
                  </button>
                )}
                {selectedRoom.status !== "active" && (
                  <button
                    onClick={() => handleStatusChange(selectedRoom._id, "active")}
                    className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20"
                    title="Reopen"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-charcoal/40">No messages yet — start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatBubble
                    key={msg._id}
                    message={msg}
                    isOwn={msg.senderRole === "agent"}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div className="border-t border-charcoal/5 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type a reply…"
                  className="flex-1 rounded-xl border border-charcoal/10 bg-charcoal/2 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                  maxLength={2000}
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-white transition-colors hover:bg-gold/90 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No room selected placeholder */
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-charcoal/10" />
              <p className="text-sm font-medium text-charcoal/40">Select a conversation</p>
              <p className="mt-1 text-xs text-charcoal/25">
                Pick a chat from the list to view and reply.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
