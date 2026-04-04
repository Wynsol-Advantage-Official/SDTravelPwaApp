// ---------------------------------------------------------------------------
// Mock Ads — lightweight stubs for development/testing
// ---------------------------------------------------------------------------

import type { Ad } from "@/types/ad";

export const mockAds: Ad[] = [
  {
    _id: "ad-001",
    title: "negril-ads",
    cover: { src: "/og/default.jpg", width: 1200, height: 800, alt: "Negril Beach Promotion" },
    mediaGallery: [
      { src: "/og/default.jpg", width: 1200, height: 800, alt: "Negril Gallery 1" },
      { src: "/og/default.jpg", width: 1200, height: 800, alt: "Negril Gallery 2" },
      { src: "/og/default.jpg", width: 1200, height: 800, alt: "Negril Gallery 3" },
    ],
    active: true,
    href: "/destinations",
  },
  {
    _id: "ad-002",
    title: "summer-deals",
    cover: { src: "/og/default.jpg", width: 1200, height: 800, alt: "Summer Deals" },
    mediaGallery: [],
    active: true,
    href: "/tours",
  },
];
