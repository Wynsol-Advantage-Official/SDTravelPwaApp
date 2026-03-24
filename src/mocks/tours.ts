// ---------------------------------------------------------------------------
// Mock Tours — lightweight tour stubs for dashboard display
// ---------------------------------------------------------------------------
// These are simplified versions of the Tour type, containing only the fields
// needed by dashboard components (TripCard, SavedDiamonds, etc.)
// ---------------------------------------------------------------------------

export const mockTours = [
  {
    _id: "tour-001",
    title: "Sahara Desert Expedition",
    slug: "sahara-desert-expedition",
    heroImageSrc: "/og/default.jpg",
    summary: "A 7-night journey through golden dunes, ancient kasbahs, and starlit camps.",
    startingPrice: 4200,
    currency: "USD",
    duration: "7 nights",
    destination: "Morocco",
    featured: true,
  },
  {
    _id: "tour-002",
    title: "Great Barrier Reef Exploration",
    slug: "great-barrier-reef-exploration",
    heroImageSrc: "/og/default.jpg",
    summary: "Dive into the world's largest coral reef system with private guides.",
    startingPrice: 4800,
    currency: "USD",
    duration: "7 nights",
    destination: "Australia",
    featured: true,
  },
  {
    _id: "tour-003",
    title: "Paris City Lights Tour",
    slug: "paris-city-lights-tour",
    heroImageSrc: "/og/default.jpg",
    summary: "4 nights of exclusive Parisian dining, art, and cultural immersion.",
    startingPrice: 2900,
    currency: "USD",
    duration: "4 nights",
    destination: "France",
    featured: true,
  },
  {
    _id: "tour-004",
    title: "Cockpit Country Adventure",
    slug: "cockpit-country-adventure",
    heroImageSrc: "/og/default.jpg",
    summary: "8 days exploring Jamaica's untouched interior — caves, rivers, and wildlife.",
    startingPrice: 3200,
    currency: "USD",
    duration: "8 days",
    destination: "Jamaica",
    featured: false,
  },
  {
    _id: "tour-005",
    title: "Discover the Ancient Rome",
    slug: "discover-the-ancient-rome",
    heroImageSrc: "/og/default.jpg",
    summary: "5-day VIP access to Rome's archaeological marvels with private historians.",
    startingPrice: 3200,
    currency: "USD",
    duration: "5 days",
    destination: "Italy",
    featured: false,
  },
] as const
