import type { HomepageContent } from "@/types/homepage";

export const homepageContent: HomepageContent = {
  hero: {
    eyebrow: "Bespoke Concierge Travel",
    headline: "Where Every Journey Becomes a Diamond",
    subhead:
      "Handcrafted luxury itineraries, curated by experts who believe your travel experience should be as rare and brilliant as a diamond.",
    primaryCta: {
      label: "Explore Diamonds",
      href: "/tours",
    },
    secondaryCta: {
      label: "Speak to a Concierge",
      href: "/dashboard/chat",
    },
    fallbackNote: "Video preview unavailable on this device.",
    video: {
      src: "/media/home-hero.mp4",
      poster: "/media/home-hero-poster.jpg",
      ariaLabel: "Aerial footage of luxury coastal travel",
    },
  },
  testimonials: [
    {
      id: "t-001",
      quote:
        "From private airport transfers to sunrise sailings in Santorini, every detail felt effortless. It was the first trip where we truly switched off and just enjoyed the moment.",
      name: "Amelia Hart",
      role: "Founder",
      location: "London, UK",
      tripType: "Anniversary Escape",
    },
    {
      id: "t-002",
      quote:
        "The concierge team anticipated things we had not even considered, from villa preferences to local dining reservations. We felt completely looked after from day one.",
      name: "Daniel Reyes",
      role: "Creative Director",
      location: "Toronto, CA",
      tripType: "Family Retreat",
    },
    {
      id: "t-003",
      quote:
        "Our itinerary balanced culture, privacy, and adventure with remarkable precision. Every transfer, guide, and hotel handoff was smooth, personal, and perfectly timed.",
      name: "Priya Nandakumar",
      role: "Managing Partner",
      location: "Singapore",
      tripType: "Multi-City Discovery",
    },
  ],
  partnerLogos: [
    {
      id: "p-001",
      name: "Aurora Air",
      logoSrc: "/logos/aurora-air.svg",
      alt: "Aurora Air",
      widthHint: 180,
      heightHint: 60,
    },
    {
      id: "p-002",
      name: "Monarch Estates",
      logoSrc: "/logos/monarch-estates.svg",
      alt: "Monarch Estates",
      widthHint: 170,
      heightHint: 54,
    },
    {
      id: "p-003",
      name: "Crestline Voyages",
      logoSrc: "/logos/crestline-voyages.svg",
      alt: "Crestline Voyages",
      widthHint: 180,
      heightHint: 60,
    },
    {
      id: "p-004",
      name: "Solis Retreats",
      logoSrc: "/logos/solis-retreats.svg",
      alt: "Solis Retreats",
      widthHint: 170,
      heightHint: 50,
    },
    {
      id: "p-005",
      name: "Northline Private Rail",
      logoSrc: "/logos/northline-private-rail.svg",
      alt: "Northline Private Rail",
      widthHint: 210,
      heightHint: 58,
    },
    {
      id: "p-006",
      name: "Vela Collective",
      logoSrc: "",
      alt: "Vela Collective",
      widthHint: 170,
      heightHint: 52,
    },
  ],
};
