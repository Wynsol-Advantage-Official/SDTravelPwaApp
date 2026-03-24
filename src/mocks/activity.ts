// ---------------------------------------------------------------------------
// Mock Activity Feed — recent account events for dashboard overview
// ---------------------------------------------------------------------------

export interface ActivityItem {
  id: string
  type: "booking_created" | "booking_confirmed" | "booking_completed" | "diamond_saved" | "message_received" | "profile_updated"
  title: string
  description: string
  timestamp: Date
  link?: string
}

export const mockActivity: ActivityItem[] = [
  {
    id: "act-001",
    type: "message_received",
    title: "New message from your concierge",
    description: "Your revised Sahara itinerary is ready with a complimentary sunrise camel ride.",
    timestamp: new Date("2026-03-16T09:15:00Z"),
    link: "/dashboard/chat",
  },
  {
    id: "act-002",
    type: "diamond_saved",
    title: "Tour saved to Diamonds",
    description: "You saved Discover the Ancient Rome to your wishlist.",
    timestamp: new Date("2026-03-14T11:45:00Z"),
    link: "/dashboard/saved",
  },
  {
    id: "act-003",
    type: "booking_created",
    title: "Booking submitted",
    description: "Discover the Ancient Rome — Jun 10–15, 2026, 1 guest.",
    timestamp: new Date("2026-03-12T16:30:00Z"),
    link: "/dashboard/bookings",
  },
  {
    id: "act-004",
    type: "diamond_saved",
    title: "Tour saved to Diamonds",
    description: "You saved Paris City Lights Tour to your wishlist.",
    timestamp: new Date("2026-03-08T09:15:00Z"),
    link: "/dashboard/saved",
  },
  {
    id: "act-005",
    type: "booking_confirmed",
    title: "Booking confirmed",
    description: "Sahara Desert Expedition — Apr 15–22, 2026, 2 guests.",
    timestamp: new Date("2026-03-05T11:20:00Z"),
    link: "/dashboard/bookings",
  },
  {
    id: "act-006",
    type: "booking_confirmed",
    title: "Booking confirmed",
    description: "Great Barrier Reef Exploration — Aug 5–12, 2026, 2 guests.",
    timestamp: new Date("2026-02-28T09:00:00Z"),
    link: "/dashboard/bookings",
  },
  {
    id: "act-007",
    type: "profile_updated",
    title: "Profile updated",
    description: "Travel preferences and phone number updated.",
    timestamp: new Date("2026-02-15T08:30:00Z"),
    link: "/dashboard/profile",
  },
]
