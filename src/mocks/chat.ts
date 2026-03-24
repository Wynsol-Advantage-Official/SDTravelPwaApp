import type { ChatRoom, ChatMessage } from "@/types/chat"

// ---------------------------------------------------------------------------
// Mock Chat Rooms & Messages — concierge conversation
// ---------------------------------------------------------------------------

export const mockChatRooms: ChatRoom[] = [
  {
    _id: "room_mock-uid-sd-001",
    clientUid: "mock-uid-sd-001",
    agentUid: "agent-concierge-001",
    tourId: "wix-tour-sahara-001",
    tourSlug: "sahara-desert-expedition",
    status: "active",
    createdAt: new Date("2026-03-01T10:00:00Z"),
    lastMessageAt: new Date("2026-03-16T09:15:00Z"),
  },
  {
    _id: "room_mock-uid-sd-002",
    clientUid: "mock-uid-sd-002",
    agentUid: "agent-concierge-001",
    tourId: "wix-tour-cockpit-002",
    tourSlug: "cockpit-country-adventure",
    status: "active",
    createdAt: new Date("2026-03-05T14:00:00Z"),
    lastMessageAt: new Date("2026-03-23T11:42:00Z"),
  },
  {
    _id: "room_mock-uid-sd-003",
    clientUid: "mock-uid-sd-003",
    agentUid: "agent-concierge-001",
    status: "active",
    createdAt: new Date("2026-03-10T08:00:00Z"),
    lastMessageAt: new Date("2026-03-22T16:30:00Z"),
  },
  {
    _id: "room_mock-uid-sd-004",
    clientUid: "mock-uid-sd-004",
    agentUid: "agent-concierge-001",
    tourId: "wix-tour-bluehole-004",
    tourSlug: "blue-hole-snorkel",
    status: "resolved",
    createdAt: new Date("2026-02-20T09:00:00Z"),
    lastMessageAt: new Date("2026-03-12T15:00:00Z"),
  },
]

// Lookup for display names in mock mode (keyed by clientUid)
export const mockClientNames: Record<string, string> = {
  "mock-uid-sd-001": "Sophia Laurent",
  "mock-uid-sd-002": "Marcus Chen",
  "mock-uid-sd-003": "Amara Okafor",
  "mock-uid-sd-004": "James Whitfield",
}

// Messages keyed by room ID (for concierge inbox mock)
export const mockRoomMessages: Record<string, ChatMessage[]> = {
  "room_mock-uid-sd-001": [
    {
      _id: "r1-msg-001",
      senderUid: "agent-concierge-001",
      senderRole: "agent",
      text: "Welcome to Sand Diamonds Travel, Sophia! I'm your dedicated concierge. How can I help you craft the perfect journey?",
      timestamp: new Date("2026-03-01T10:00:00Z"),
      read: true,
    },
    {
      _id: "r1-msg-002",
      senderUid: "mock-uid-sd-001",
      senderRole: "client",
      text: "Hi! I'm interested in the Sahara Desert Expedition for my anniversary in April. Are there any private dinner options?",
      timestamp: new Date("2026-03-01T10:02:00Z"),
      read: true,
    },
    {
      _id: "r1-msg-003",
      senderUid: "agent-concierge-001",
      senderRole: "agent",
      text: "Absolutely! We offer a private starlit dinner in the dunes — champagne, a personal chef, and Berber musicians.",
      timestamp: new Date("2026-03-01T10:05:00Z"),
      read: true,
    },
    {
      _id: "r1-msg-004",
      senderUid: "mock-uid-sd-001",
      senderRole: "client",
      text: "Perfect, thank you! Looking forward to it.",
      timestamp: new Date("2026-03-01T10:08:00Z"),
      read: true,
    },
    {
      _id: "r1-msg-005",
      senderUid: "agent-concierge-001",
      senderRole: "agent",
      text: "Just following up — your revised Sahara itinerary is ready with the private dinner add-on. Let me know if you need any changes!",
      timestamp: new Date("2026-03-16T09:15:00Z"),
      read: false,
    },
  ],
  "room_mock-uid-sd-002": [
    {
      _id: "r2-msg-001",
      senderUid: "agent-concierge-001",
      senderRole: "agent",
      text: "Hello Marcus! Welcome to Sand Diamonds. I see you're interested in the Cockpit Country Adventure — an incredible choice!",
      timestamp: new Date("2026-03-05T14:00:00Z"),
      read: true,
    },
    {
      _id: "r2-msg-002",
      senderUid: "mock-uid-sd-002",
      senderRole: "client",
      text: "Yes! We're a group of 6 birders. Can you accommodate us and arrange a local guide?",
      timestamp: new Date("2026-03-05T14:15:00Z"),
      read: true,
    },
    {
      _id: "r2-msg-003",
      senderUid: "agent-concierge-001",
      senderRole: "agent",
      text: "Absolutely, groups of 6 are perfect for our private guided birding experience. I'll connect you with our specialist guide.",
      timestamp: new Date("2026-03-05T14:30:00Z"),
      read: true,
    },
    {
      _id: "r2-msg-004",
      senderUid: "mock-uid-sd-002",
      senderRole: "client",
      text: "Great! What's the best time of year for endemics?",
      timestamp: new Date("2026-03-23T11:40:00Z"),
      read: false,
    },
    {
      _id: "r2-msg-005",
      senderUid: "mock-uid-sd-002",
      senderRole: "client",
      text: "Also, can we extend by 2 days to visit the Blue Mountains?",
      timestamp: new Date("2026-03-23T11:42:00Z"),
      read: false,
    },
  ],
  "room_mock-uid-sd-003": [
    {
      _id: "r3-msg-001",
      senderUid: "mock-uid-sd-003",
      senderRole: "client",
      text: "Hi, I'd like some information about your luxury African safari options.",
      timestamp: new Date("2026-03-10T08:00:00Z"),
      read: true,
    },
    {
      _id: "r3-msg-002",
      senderUid: "agent-concierge-001",
      senderRole: "agent",
      text: "Hello Amara! We have several extraordinary safari experiences. Are you looking for East Africa, Southern Africa, or something else?",
      timestamp: new Date("2026-03-10T08:30:00Z"),
      read: true,
    },
    {
      _id: "r3-msg-003",
      senderUid: "mock-uid-sd-003",
      senderRole: "client",
      text: "East Africa — Kenya preferably. Private camp, no more than 10 guests.",
      timestamp: new Date("2026-03-22T16:30:00Z"),
      read: false,
    },
  ],
  "room_mock-uid-sd-004": [
    {
      _id: "r4-msg-001",
      senderUid: "mock-uid-sd-004",
      senderRole: "client",
      text: "Hello, I booked the Blue Hole Snorkel experience. Can I get the dive briefing documents?",
      timestamp: new Date("2026-02-20T09:00:00Z"),
      read: true,
    },
    {
      _id: "r4-msg-002",
      senderUid: "agent-concierge-001",
      senderRole: "agent",
      text: "Hi James! I've emailed you the full dive briefing and waiver forms. Please sign and return at your earliest convenience.",
      timestamp: new Date("2026-02-20T09:45:00Z"),
      read: true,
    },
    {
      _id: "r4-msg-003",
      senderUid: "mock-uid-sd-004",
      senderRole: "client",
      text: "Got them, all signed and returned. Thanks for the great experience!",
      timestamp: new Date("2026-03-12T15:00:00Z"),
      read: true,
    },
  ],
}

// ---------------------------------------------------------------------------
// Legacy flat message list (used by client-side concierge chat page)
// ---------------------------------------------------------------------------

export const mockChatMessages: ChatMessage[] = mockRoomMessages["room_mock-uid-sd-001"]

