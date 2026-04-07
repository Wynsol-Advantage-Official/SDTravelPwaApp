// ---------------------------------------------------------------------------
// Booking Interfaces — maps to Firestore `bookings/` collection
// ---------------------------------------------------------------------------

export type DataSource = "STORES" | "CMS";

// ---------------------------------------------------------------------------
// Pickup / Transfer Details — collected during booking for concierge handoff
// ---------------------------------------------------------------------------

export interface FlightPickup {
  type: "flight"
  departureCountry: string
  departureAirport: string   // IATA code or name guest is flying FROM
  arrivalAirport: string     // airport they are landing at
  arrivalDate: string        // ISO date, may differ from tour date
  arrivalTime: string        // HH:mm local time at arrival airport
  flightNumber?: string
}

export interface ResortPickup {
  type: "resort"
  hotelName: string
  hotelAddress: string
  roomNumber: string
}

export interface AirbnbPickup {
  type: "airbnb"
  address: string
}

export type PickupDetails = FlightPickup | ResortPickup | AirbnbPickup

export interface Booking {
  _id: string;
  uid: string;
  /** Tenant this booking belongs to. All queries must filter by tenantId. */
  tenantId: string;
  tourTitle: string;
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;

  // Hybrid-model fields (from initiate.ts)
  tourId?: string;
  dataSource?: DataSource;
  isCheckoutEnabled?: boolean;
  userSubmittedPrice?: number;
  tourDate?: string | null;

  // Pickup / transfer details collected during booking wizard
  pickupDetails?: PickupDetails;

  // Legacy / Wix Bookings fields
  wixBookingId?: string;
  tourSlug?: string;
  guests?: number;
  dates?: {
    start: Date;
    end: Date;
  };
  specialRequests?: string;
}

export type BookingStatus =
  | "pending"
  | "hold"
  | "confirmed"
  | "awaiting_payment"
  | "completed"
  | "cancelled";

export interface BookingAvailability {
  date: string; // ISO date
  spotsAvailable: number;
  pricePerPerson: number;
  currency: string;
}

// ---------------------------------------------------------------------------
// Enriched Booking — admin-list API joins user + tour data for dashboard
// ---------------------------------------------------------------------------

export interface EnrichedBooking extends Booking {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  userPhone?: string;
  userCountry?: string;
  tourHeroImage?: string;
  /** Number of child itinerary days from Wix CMS */
  itineraryDayCount?: number;
}
