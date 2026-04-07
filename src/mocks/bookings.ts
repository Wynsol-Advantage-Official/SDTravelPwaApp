import type { Booking, BookingStatus } from "@/types/booking"

// ---------------------------------------------------------------------------
// Mock Bookings — realistic luxury travel bookings
// ---------------------------------------------------------------------------

export const mockBookings: Booking[] = [
  {
    _id: "bk-001",
    uid: "mock-uid-sd-001",
    tenantId: "www",
    wixBookingId: "wix-bk-a1b2c3",
    tourSlug: "sahara-desert-expedition",
    tourTitle: "Sahara Desert Expedition",
    status: "confirmed" as BookingStatus,
    guests: 2,
    totalPrice: 8400,
    currency: "USD",
    dates: {
      start: new Date("2026-04-15T00:00:00Z"),
      end: new Date("2026-04-22T00:00:00Z"),
    },
    specialRequests: "Anniversary celebration — champagne and private dinner under the stars.",
    createdAt: new Date("2026-03-01T09:45:00Z"),
    updatedAt: new Date("2026-03-05T11:20:00Z"),
  },
  {
    _id: "bk-002",
    uid: "mock-uid-sd-001",
    tenantId: "www",
    wixBookingId: "wix-bk-d4e5f6",
    tourSlug: "discover-the-ancient-rome",
    tourTitle: "Discover the Ancient Rome",
    status: "pending" as BookingStatus,
    guests: 1,
    totalPrice: 3200,
    currency: "USD",
    dates: {
      start: new Date("2026-06-10T00:00:00Z"),
      end: new Date("2026-06-15T00:00:00Z"),
    },
    createdAt: new Date("2026-03-12T16:30:00Z"),
    updatedAt: new Date("2026-03-12T16:30:00Z"),
  },
  {
    _id: "bk-003",
    uid: "mock-uid-sd-001",
    tenantId: "www",
    wixBookingId: "wix-bk-g7h8i9",
    tourSlug: "cockpit-country-adventure",
    tourTitle: "Cockpit Country Adventure",
    status: "completed" as BookingStatus,
    guests: 4,
    totalPrice: 12800,
    currency: "USD",
    dates: {
      start: new Date("2025-12-20T00:00:00Z"),
      end: new Date("2025-12-28T00:00:00Z"),
    },
    specialRequests: "Family trip — two children under 12.",
    createdAt: new Date("2025-11-10T08:00:00Z"),
    updatedAt: new Date("2026-01-02T10:00:00Z"),
  },
  {
    _id: "bk-004",
    uid: "mock-uid-sd-001",
    tenantId: "www",
    wixBookingId: "wix-bk-j0k1l2",
    tourSlug: "great-barrier-reef-exploration",
    tourTitle: "Great Barrier Reef Exploration",
    status: "confirmed" as BookingStatus,
    guests: 2,
    totalPrice: 9600,
    currency: "USD",
    dates: {
      start: new Date("2026-08-05T00:00:00Z"),
      end: new Date("2026-08-12T00:00:00Z"),
    },
    createdAt: new Date("2026-02-20T14:15:00Z"),
    updatedAt: new Date("2026-02-28T09:00:00Z"),
  },
  {
    _id: "bk-005",
    uid: "mock-uid-sd-001",
    tenantId: "www",
    wixBookingId: "wix-bk-m3n4o5",
    tourSlug: "paris-city-lights-tour",
    tourTitle: "Paris City Lights Tour",
    status: "cancelled" as BookingStatus,
    guests: 2,
    totalPrice: 5800,
    currency: "USD",
    dates: {
      start: new Date("2026-02-14T00:00:00Z"),
      end: new Date("2026-02-18T00:00:00Z"),
    },
    createdAt: new Date("2025-12-01T12:00:00Z"),
    updatedAt: new Date("2026-01-15T09:30:00Z"),
  },
]

// ---------------------------------------------------------------------------
// Derived stats for the dashboard overview
// ---------------------------------------------------------------------------

export const mockBookingStats = {
  total: mockBookings.length,
  upcoming: mockBookings.filter(
    (b) => b.status === "confirmed" && b.dates && new Date(b.dates.start) > new Date(),
  ).length,
  completed: mockBookings.filter((b) => b.status === "completed").length,
  pending: mockBookings.filter((b) => b.status === "pending").length,
  totalSpent: mockBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0),
}
