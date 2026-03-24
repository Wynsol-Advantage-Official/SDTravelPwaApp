import type { SavedDiamond } from "@/types/user"

// ---------------------------------------------------------------------------
// Mock Saved Diamonds — wishlisted tours
// ---------------------------------------------------------------------------

export const mockSavedDiamonds: SavedDiamond[] = [
  {
    tourId: "tour-001",
    tourSlug: "sahara-desert-expedition",
    tourTitle: "Sahara Desert Expedition",
    heroImageSrc: "/og/default.jpg",
    savedAt: new Date("2026-02-18T10:30:00Z"),
    notes: "Perfect for our anniversary trip",
  },
  {
    tourId: "tour-002",
    tourSlug: "great-barrier-reef-exploration",
    tourTitle: "Great Barrier Reef Exploration",
    heroImageSrc: "/og/default.jpg",
    savedAt: new Date("2026-03-02T14:00:00Z"),
    notes: "Bucket list — must do this year",
  },
  {
    tourId: "tour-003",
    tourSlug: "paris-city-lights-tour",
    tourTitle: "Paris City Lights Tour",
    heroImageSrc: "/og/default.jpg",
    savedAt: new Date("2026-03-08T09:15:00Z"),
  },
  {
    tourId: "tour-004",
    tourSlug: "cockpit-country-adventure",
    tourTitle: "Cockpit Country Adventure",
    heroImageSrc: "/og/default.jpg",
    savedAt: new Date("2026-01-25T17:00:00Z"),
    notes: "Family adventure — kids will love this",
  },
  {
    tourId: "tour-005",
    tourSlug: "discover-the-ancient-rome",
    tourTitle: "Discover the Ancient Rome",
    heroImageSrc: "/og/default.jpg",
    savedAt: new Date("2026-03-14T11:45:00Z"),
  },
]
