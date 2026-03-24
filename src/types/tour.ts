// ---------------------------------------------------------------------------
// Tour Interfaces — mirrors the Wix CMS "Tours" and "ItineraryDays" collections
// ---------------------------------------------------------------------------

export interface Tour {
  /** Wix CMS document _id */
  _id: string;
  title: string;
  slug: string;
  destination: DestinationRef;
  heroImage: WixImage;
  gallery: WixImage[];
  summary: string;
  description: string;
  duration: number;
  startingPrice: number;
  currency: string;
  highlights: string[];
  included: string;
  excluded: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
}

export interface ItineraryDay {
  _id: string;
  tour: string; // Tour _id reference
  dayNumber: number;
  title: string;
  description: string;
  image: WixImage;
  activities: Activity[];
  meals: string;
  accommodation: string;
  /** Full Destination records referenced by this itinerary day (Wix multi-ref, fetched via queryReferenced) */
  destinations: Destination[];
}

export interface Activity {
  name: string;
  time?: string;
  description?: string;
}

export interface DestinationRef {
  _id: string;
  name: string;
  region: string;
  slug: string;
}

export interface Destination extends DestinationRef {
  heroImage: WixImage;
  gallery: WixImage[];
  description: string;
  climate: string;
  seoTitle: string;
  seoDescription: string;
}

export interface WixImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Accommodation {
  _id: string;
  /** Property name, e.g. "Singita Grumeti Lodge" */
  name: string;
  /** Property type, e.g. "Safari Lodge", "Boutique Hotel", "Private Villa" */
  type: string;
  /** City or region, e.g. "Serengeti, Tanzania" */
  location: string;
  description: string;
  image: WixImage;
  gallery: WixImage[];
  pricePerNight: number;
  currency: string;
  rating: number;
  amenities: string[];
  /** Number of nights spent at this property on this tour */
  nights: number;
  /** Reference to parent Tour._id */
  tour: string;
}
