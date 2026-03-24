import type { ChatRoom, ChatMessage } from "@/types/chat"

// ---------------------------------------------------------------------------
// Mock Chat Rooms & Messages — concierge conversation
// ---------------------------------------------------------------------------

export const mockChatRooms: ChatRoom[] = [
  {
    _id: "room_mock-uid-sd-001",
    clientUid: "mock-uid-sd-001",
    agentUid: "agent-concierge-001",
    tourSlug: "sahara-desert-expedition",
    status: "active",
    createdAt: new Date("2026-03-01T10:00:00Z"),
    lastMessageAt: new Date("2026-03-16T09:15:00Z"),
  },
]

export const mockChatMessages: ChatMessage[] = [
  {
    _id: "msg-001",
    senderUid: "agent-concierge-001",
    senderRole: "agent",
    text: "Welcome to Sand Diamonds Travel, Sophia! I'm your dedicated concierge. How can I help you craft the perfect journey?",
    timestamp: new Date("2026-03-01T10:00:00Z"),
    read: true,
  },
  {
    _id: "msg-002",
    senderUid: "mock-uid-sd-001",
    senderRole: "client",
    text: "Hi! I'm interested in the Sahara Desert Expedition for my anniversary in April. Are there any private dinner options?",
    timestamp: new Date("2026-03-01T10:02:00Z"),
    read: true,
  },
  {
    _id: "msg-003",
    senderUid: "agent-concierge-001",
    senderRole: "agent",
    text: "Absolutely! We offer a private starlit dinner in the dunes — a table set for two with champagne, a personal chef, and traditional Berber musicians. It's one of our most popular anniversary experiences.",
    timestamp: new Date("2026-03-01T10:05:00Z"),
    read: true,
  },
  {
    _id: "msg-004",
    senderUid: "mock-uid-sd-001",
    senderRole: "client",
    text: "That sounds incredible! Can you add that to our booking? Also, is there a luxury camp option or hotel?",
    timestamp: new Date("2026-03-01T10:08:00Z"),
    read: true,
  },
  {
    _id: "msg-005",
    senderUid: "agent-concierge-001",
    senderRole: "agent",
    text: "Of course! You'll be staying at a premium glamping camp with en-suite facilities, air conditioning, and panoramic desert views. I've noted the private dinner add-on for your April 15–22 booking. I'll send you a revised itinerary shortly.",
    timestamp: new Date("2026-03-01T10:12:00Z"),
    read: true,
  },
  {
    _id: "msg-006",
    senderUid: "mock-uid-sd-001",
    senderRole: "client",
    text: "Perfect, thank you so much! Looking forward to it.",
    timestamp: new Date("2026-03-01T10:14:00Z"),
    read: true,
  },
  {
    _id: "msg-007",
    senderUid: "agent-concierge-001",
    senderRole: "agent",
    text: "Hi Sophia! Just following up — your revised Sahara itinerary is ready. I've also added a complimentary sunrise camel ride as our gift for your anniversary. 🐪✨ Let me know if you'd like any other changes!",
    timestamp: new Date("2026-03-16T09:15:00Z"),
    read: false,
  },
]
