import { headers } from "next/headers";
import { wixClient, wixCmsAdminClient } from "./client";
import { getWixImageUrl, getWixImageDimensions } from "./media";

/**
 * Read the x-wix-site-id header injected by Edge Middleware for the current
 * request. This is the per-tenant Wix Meta Site ID — absent for www.
 */
async function getTenantSiteId(): Promise<string | undefined> {
  try {
    const hdrs = await headers();
    return hdrs.get("x-wix-site-id") ?? undefined;
  } catch {
    return undefined;
  }
}
import type {
  Tour,
  ItineraryDay,
  Activity,
  Destination,
  Room,
  WixImage,
} from "@/types/tour";

// ---------------------------------------------------------------------------
// Collection IDs — must match the Wix CMS Dashboard exactly
// ---------------------------------------------------------------------------
const TOURS_COLLECTION = "Tours";
const ITINERARY_COLLECTION = "ItineraryDays";
const DESTINATIONS_COLLECTION = "Destinations1";
const ROOMS_COLLECTION = "Rooms";

// ---------------------------------------------------------------------------
// Image Mapping Helper
// ---------------------------------------------------------------------------

function mapWixImage(raw: Record<string, unknown> | string | undefined): WixImage {
  if (!raw) {
    return { src: "/og/default.jpg", width: 1200, height: 675, alt: "" };
  }

  // If it's a string (wix:image:// URI or URL)
  if (typeof raw === "string") {
    const dims = getWixImageDimensions(raw);
    return {
      src: getWixImageUrl(raw),
      width: dims.width,
      height: dims.height,
      alt: "",
    };
  }

  // Wix image object shape
  const src = (raw.src as string) ?? (raw.url as string) ?? "";
  const dims = getWixImageDimensions(src);
  return {
    src: getWixImageUrl(src),
    width: (raw.width as number) ?? dims.width,
    height: (raw.height as number) ?? dims.height,
    alt: (raw.alt as string) ?? (raw.title as string) ?? "",
  };
}

function mapGallery(raw: unknown): WixImage[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => mapWixImage(item as Record<string, unknown>));
}

function parseHighlights(raw: unknown): string[] {
  if (typeof raw === "string") {
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (Array.isArray(raw)) return raw as string[];
  return [];
}

function parseActivities(raw: unknown): Activity[] {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Activity[];
    } catch {
      return [{ name: raw }];
    }
  }
  if (Array.isArray(raw)) return raw as Activity[];
  return [];
}

// ---------------------------------------------------------------------------
// Tour Data Mapping
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawItem = Record<string, any>;

// Normalize a tour reference field to a string _id.
function normalizeTourRef(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (!first) return "";
    if (typeof first === "string") return first;
    return (first as Record<string, unknown>)?._id as string ?? "";
  }
  if (typeof raw === "object") {
    return (raw as Record<string, unknown>)?._id as string ?? "";
  }
  return "";
}

function mapTour(item: RawItem): Tour {
  return {
    _id: (item._id as string) ?? "",
    title: (item.title as string) ?? "",
    slug: (item.slug as string) ?? "",
    destination: {
      _id: (item.destination as RawItem)?._id as string ?? "",
      name: (item.destination as RawItem)?.name as string ?? "",
      region: (item.destination as RawItem)?.region as string ?? "",
      slug: (item.destination as RawItem)?.slug as string ?? "",
    },
    heroImage: mapWixImage(item.heroImage as Record<string, unknown> | string),
    gallery: mapGallery(item.gallery),
    summary: (item.summary as string) ?? "",
    description: (item.description as string) ?? "",
    duration: (item.duration as number) ?? 0,
    startingPrice: (item.startingPrice as number) ?? 0,
    currency: (item.currency as string) ?? "USD",
    highlights: parseHighlights(item.highlights),
    included: (item.included as string) ?? "",
    excluded: (item.excluded as string) ?? "",
    seoTitle: (item.seoTitle as string) ?? "",
    seoDescription: (item.seoDescription as string) ?? "",
    featured: (item.featured as boolean) ?? false,
    status: ((item.status as string) ?? "draft") as Tour["status"],
  };
}

function mapItineraryDay(item: RawItem): ItineraryDay {
  return {
    _id: (item._id as string) ?? "",
    tour: normalizeTourRef(item.tour),
    dayNumber: (item.dayNumber as number) ?? 0,
    title: (item.title as string) ?? "",
    description: (item.description as string) ?? "",
    image: mapWixImage(item.image as Record<string, unknown> | string),
    activities: parseActivities(item.activities),
    meals: (item.meals as string) ?? "",
    room: (item.room as string) ?? "",
    // Populated separately via queryReferenced — Wix multi-ref fields are not
    // included in regular .query() results.
    destinations: [],
  };
}

function mapDestination(item: RawItem): Destination {
  return {
    _id: (item._id as string) ?? "",
    name: (item.name as string) ?? "",
    region: (item.region as string) ?? "",
    slug: (item.slug as string) ?? "",
    heroImage: mapWixImage(item.heroImage as Record<string, unknown> | string),
    gallery: mapGallery(item.gallery),
    description: (item.description as string) ?? "",
    climate: (item.climate as string) ?? "",
    seoTitle: (item.seoTitle as string) ?? "",
    seoDescription: (item.seoDescription as string) ?? "",
  };
}

function parseAmenities(raw: unknown): string[] {
  if (typeof raw === "string") {
    return raw.split("|").map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(raw)) return raw as string[];
  return [];
}

function mapRoom(item: RawItem): Room {
  return {
    _id: (item._id as string) ?? "",
    // Support multiple possible FieldIDs used in Wix for legacy/imported data
    name:
      (item.resortName as string) ??
      (item["Resort Name"] as string) ??
      (item.name as string) ??
      (item.title as string) ??
      "",
    type: (item.type as string) ?? (item.propertyType as string) ?? "Hotel",
    location: (item.location as string) ?? (item.city as string) ?? "",
    // Description may be stored in several fields; prefer `description`, then
    // resort-specific fields used in imports.
    description:
      (item.description as string) ?? (item["Resort Description"] as string) ?? (item.resortDescription as string) ?? "",
    // Prefer a few possible image FieldIDs (Resort Image, image, heroImage)
    image: mapWixImage(
      (item.resortImage as Record<string, unknown> | string) ??
      (item["Resort Image"] as Record<string, unknown> | string) ??
      (item.image as Record<string, unknown> | string) ??
      (item.heroImage as Record<string, unknown> | string)
    ),
    gallery: mapGallery(item.gallery),
    pricePerNight: (item.pricePerNight as number) ?? (item.price as number) ?? 0,
    currency: (item.currency as string) ?? "USD",
    rating: (item.rating as number) ?? 0,
    amenities: parseAmenities(item.amenities),
    nights: (item.nights as number) ?? 1,
    tour: normalizeTourRef(item.tour ?? item.TourReferenceID),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all published + featured tours (for homepage and listing page).
 * Results are sorted by title ascending.
 */
export async function getTours(options?: {
  featuredOnly?: boolean;
  activeOnly?: boolean;
}): Promise<Tour[]> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return [];

  // By default the service returns only published tours. Callers may opt-out
  // by passing `activeOnly: false` (used primarily by tooling/debug routes).
  const includeStatus = options?.activeOnly ?? true;

  let query = client.items.query(TOURS_COLLECTION);
  // if (includeStatus) query = query.eq("status", "published");
  console.log(query)
  if (options?.featuredOnly) {
    query = query.eq("featured", true);
  }
    
  if (options?.activeOnly) {
    query = query.eq("isActive", true);
  }

  let result;
  try {
    result = await query.find();
    console.log("Fetched tours:", result);
  } catch (err: unknown) {
    // Common Wix errors here include WDE0117 (MetaSite not found) when the
    // configured site id is incorrect or missing, or WDE0027 permission
    // issues when the OAuth client lacks read permission on the collection.
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err) || String(err);
    console.error("[getTours] Wix query failed:", errMsg, err);
    console.error(
      "[getTours] Check: WIX_META_SITE_ID/WIX_SITE_ID, WIX_CLIENT_ID, WIX_CLIENT_SECRET, and that the collection '" +
      TOURS_COLLECTION +
      "' has read permissions enabled in Wix CMS\u2192Permissions.",
    );
    return [];
  }

  // Map tours
  if (!result.items || result.items.length === 0) {
    try {
      // Fallback: try again without the status filter but keep other requested filters
      let fallbackQuery = client.items.query(TOURS_COLLECTION);
      if (options?.activeOnly) fallbackQuery = fallbackQuery.eq("isActive", true);
      if (options?.featuredOnly) fallbackQuery = fallbackQuery.eq("featured", true);
      const fallback = await fallbackQuery.find();
      console.log("Fetched tours (fallback, no status filter):", fallback);
      const mapped = (fallback.items ?? []).map((item) => mapTour(item as RawItem));
      // Enrich durations from itinerary counts where available
      await Promise.all(
        mapped.map(async (t) => {
          try {
            const c = await getItineraryDayCount(t._id);
            if (c > 0) t.duration = c;
          } catch {
            // ignore
          }
        }),
      );
      return mapped;
    } catch (err) {
      console.error("Wix fallback query failed:", err);
      return [];
    }
  }

  const mapped = (result.items ?? []).map((item) => mapTour(item as RawItem));
  await Promise.all(
    mapped.map(async (t) => {
      try {
        const c = await getItineraryDayCount(t._id);
        if (c > 0) t.duration = c;
      } catch {
        // ignore
      }
    }),
  );

  return mapped;
}

/**
 * Fetch a single tour by slug, including its itinerary days sorted by dayNumber
 * and the full Destination record (for the gallery filler images).
 */
export async function getTourBySlug(
  slug: string
): Promise<{ tour: Tour; itinerary: ItineraryDay[]; destination: Destination | null; rooms: Room[] } | null> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return null;

  // 1. Fetch the tour
  let tourResult = await client.items
    .query(TOURS_COLLECTION)
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .find();

  // If no results with the status filter, try again without it
  if (!tourResult.items || tourResult.items.length === 0) {
    console.log("No tour found with status=published for slug:", slug);
    try {
      const fallback = await client.items
        .query(TOURS_COLLECTION)
        .eq("slug", slug)
        .limit(1)
        .find();
      console.log("Tour fallback result:", fallback);
      if (!fallback.items || fallback.items.length === 0) return null;
      // Use the found fallback as the tourResult so the unified itinerary
      // lookup logic below will run for both published and fallback cases.
      // Replace tourResult with fallback and continue.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // (we'll remap to `tour` after the conditional)
      // overwrite tourResult to the fallback
      // @ts-ignore
      tourResult = fallback;
    } catch (err) {
      console.error("Wix tour fallback query failed:", err);
      return null;
    }
  }

  const tour = mapTour(tourResult.items[0] as RawItem);

  // 2. Fetch child itinerary days where `tour` === parent Tour._id
  //    Canonical query: the `tour` field stores the parent _id directly.
  let itineraryItems: RawItem[] = [];
  try {
    const dayResult = await client.items
      .query(ITINERARY_COLLECTION)
      .eq("tour", tour._id)
      .ascending("dayNumber")
      .find();
    itineraryItems = (dayResult.items ?? []) as RawItem[];
  } catch (err) {
    console.warn("[tours] Canonical itinerary query failed:", err);
  }

  // Migration fallback: some legacy records may use a TourReferenceID field
  if (itineraryItems.length === 0) {
    try {
      const legacyResult = await client.items
        .query(ITINERARY_COLLECTION)
        .eq("TourReferenceID", tour._id)
        .ascending("dayNumber")
        .find();
      itineraryItems = (legacyResult.items ?? []) as RawItem[];
      if (itineraryItems.length > 0) {
        console.warn(
          `[tours] Itinerary for "${tour.slug}" resolved via legacy TourReferenceID. Migrate these records to use the canonical 'tour' field.`
        );
      }
    } catch {
      // TourReferenceID field may not exist — non-fatal
    }
  }

  const itinerary = itineraryItems.map((item) => mapItineraryDay(item as RawItem));

  // 2b. Fetch per-day destinations via Wix multi-ref queryReferenced.
  //     Wix CMS multi-reference fields are NOT returned in regular .query()
  //     results — a separate queryReferenced call is required per item.
  try {
    const dayDestResults = await Promise.all(
      itinerary.map(async (day) => {
        try {
          // Try the lowercase FieldID first; Wix auto-assigns camelCase IDs.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ref = await (client.items as any).queryReferenced(
            ITINERARY_COLLECTION,
            day._id,
            "destinations",
          );
          const rawItems: RawItem[] = (ref.items ?? []) as RawItem[];
          return rawItems.map((r) => mapDestination(r));
        } catch {
          return [] as Destination[];
        }
      })
    );
    // Merge full Destination records back onto each itinerary day.
    for (let i = 0; i < itinerary.length; i++) {
      itinerary[i] = { ...itinerary[i], destinations: dayDestResults[i] };
    }
  } catch {
    // Non-fatal — days will just have empty destinations[]
  }

  // 3. Fetch the linked Destination record (for gallery filler images)
  let destination: Destination | null = null
  if (tour.destination?._id) {
    try {
      const destById = await client.items
        .query(DESTINATIONS_COLLECTION)
        .eq("_id", tour.destination._id)
        .limit(1)
        .find()
      const destItem = destById.items?.[0] as RawItem | undefined
      if (destItem) {
        destination = mapDestination(destItem)
      } else if (tour.destination.slug) {
        // Fallback: match by slug
        const destBySlug = await client.items
          .query(DESTINATIONS_COLLECTION)
          .eq("slug", tour.destination.slug)
          .limit(1)
          .find()
        const slugItem = destBySlug.items?.[0] as RawItem | undefined
        if (slugItem) destination = mapDestination(slugItem)
      }
    } catch {
      // Destination collection may not exist yet — non-fatal
    }
  }

  // 4. Fetch Rooms matching this tour
  let rooms: Room[] = []
  try {
    const accResult = await client.items
      .query(ROOMS_COLLECTION)
      .eq("tour", tour._id)
      .find()
    if (accResult.items && accResult.items.length > 0) {
      rooms = (accResult.items as RawItem[]).map(mapRoom)
    } else {
      // Fallback: derive unique rooms from itinerary days
      const seen = new Map<string, Room>()
      for (const day of itinerary) {
        if (!day.room) continue
        const key = day.room.trim()
        if (seen.has(key)) {
          // increment nights
          seen.get(key)!.nights += 1
        } else {
          // If the room text looks like a Wix UUID, use it as the
          // real _id so the enrichment step below can fetch the full record.
          const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          const isUUID = UUID_RE.test(key)
          seen.set(key, {
            _id: isUUID ? key : `itinerary-${day._id}`,
            name: isUUID ? "" : key, // real name will be resolved in enrichment
            type: "",
            location: destination?.name ?? "",
            description: "",
            image: { src: "/og/default.jpg", width: 1200, height: 675, alt: "" },
            gallery: [],
            pricePerNight: 0,
            currency: tour.currency,
            rating: 0,
            amenities: [],
            nights: 1,
            tour: tour._id,
          })
        }
      }
      rooms = [...seen.values()]
    }
  } catch {
    // Rooms collection may not exist yet — non-fatal
  }

  // 5. Enrich rooms with server-side fetched records when the
  // canonical `image` FieldID is missing. This ensures images are present
  // during SSR / prerender if Wix credentials are available. Skip
  // autogenerated itinerary-derived placeholders (ids starting with
  // `itinerary-`).
  try {
    const DEFAULT_SRC = "/og/default.jpg"
    const enriched = await Promise.all(
      rooms.map(async (acc) => {
        // Skip non-resolvable placeholder stubs
        if (!acc._id || (acc._id.startsWith("itinerary-") && !acc.name)) return acc
        const hasLocalImage = acc.image?.src && acc.image.src !== DEFAULT_SRC
        const hasGallery = acc.gallery && acc.gallery.length > 0
        if (hasLocalImage && hasGallery && acc.name && acc.description) return acc

        const remote = await getRoomById(acc._id)
        if (!remote) return acc

        return {
          ...acc,
          name: acc.name || remote.name,
          description: acc.description || remote.description,
          image: remote.image ?? acc.image,
          gallery: remote.gallery && remote.gallery.length > 0 ? remote.gallery : acc.gallery,
          pricePerNight: acc.pricePerNight || remote.pricePerNight,
          currency: acc.currency || remote.currency,
          rating: acc.rating || remote.rating,
          amenities: acc.amenities && acc.amenities.length > 0 ? acc.amenities : remote.amenities,
        }
      })
    )
    rooms = enriched
  } catch (e) {
    // Non-fatal: if remote fetch fails, continue with existing rooms
    console.warn("[tours] room enrichment failed:", e)
  }

  // Ensure `tour.duration` reflects the actual itinerary days.
  // Prefer the highest `dayNumber` found; fall back to `itinerary.length` or the
  // author-provided `tour.duration` if neither is available.
  try {
    const maxDayNumber = itinerary.reduce((max, d) => Math.max(max, d.dayNumber || 0), 0);
    if (maxDayNumber > 0) {
      tour.duration = maxDayNumber;
    } else if (itinerary.length > 0) {
      tour.duration = Math.max(tour.duration || 0, itinerary.length);
    }
  } catch (e) {
    // Non-fatal — keep existing tour.duration
  }

  return { tour, itinerary, destination, rooms };
}

/**
 * Fetch a single tour by _id (Parent lookup). Used by the booking API
 * to verify price against the canonical parent record.
 */
export async function getTourById(id: string): Promise<Tour | null> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return null;

  try {
    const result = await client.items
      .query(TOURS_COLLECTION)
      .eq("_id", id)
      .limit(1)
      .find();

    const item = result.items?.[0] as RawItem | undefined;
    return item ? mapTour(item) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the count of itinerary days for a given tour _id.
 * Used by the admin-list API to enrich bookings with duration.
 */
export async function getItineraryDayCount(tourId: string): Promise<number> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return 0;

  try {
    // Prefer canonical `tour` field
    let result = await client.items
      .query(ITINERARY_COLLECTION)
      .eq("tour", tourId)
      .find();

    // Migration fallback: some legacy records use `TourReferenceID`
    if ((!result.items || result.items.length === 0)) {
      try {
        const legacy = await client.items
          .query(ITINERARY_COLLECTION)
          .eq("TourReferenceID", tourId)
          .find();
        result = legacy;
      } catch {
        // ignore and continue with original result
      }
    }

    const items = result.items ?? [];
    if (items.length === 0) return 0;

    // Prefer the highest `dayNumber` where present; otherwise fall back to count
    const maxDay = items.reduce((max, it) => {
      const dn = (it?.dayNumber as number) ?? 0;
      return Math.max(max, dn);
    }, 0);
    return maxDay > 0 ? maxDay : items.length;
  } catch {
    return 0;
  }
}

/**
 * Fetch all published tour slugs — used by generateStaticParams().
 */
export async function getAllTourSlugs(): Promise<string[]> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return [];

  const result = await client.items
    .query(TOURS_COLLECTION)
    .eq("status", "published")
    .find();

  if (!result.items || result.items.length === 0) {
    console.log("No slugs returned with status=published, trying fallback");
    try {
      const fallback = await client.items.query(TOURS_COLLECTION).find();
      return (fallback.items ?? [])
        .map((item) => (item as RawItem).slug as string)
        .filter(Boolean);
    } catch (err) {
      console.error("Wix slug fallback query failed:", err);
      return [];
    }
  }

  return (result.items ?? [])
    .map((item) => (item as RawItem).slug as string)
    .filter(Boolean);
}

/**
 * Fetch a single destination by its slug. Used by the detail page.
 */
export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return null;
  try {
    const result = await client.items
      .query(DESTINATIONS_COLLECTION)
      .eq("slug", slug)
      .limit(1)
      .find();
    const item = result.items?.[0] as RawItem | undefined;
    return item ? mapDestination(item) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch all destinations for the hub page.
 */
export async function getDestinations(): Promise<Destination[]> {
  const client = wixClient(await getTenantSiteId());
  if (!client) {
    console.error("[getDestinations] Wix client not initialised — check WIX_CLIENT_ID env var");
    return [];
  }

  try {
    const result = await client.items
      .query(DESTINATIONS_COLLECTION)
      .find();

    console.log(`[getDestinations] fetched ${result.items?.length ?? 0} items from "${DESTINATIONS_COLLECTION}"`);
    return (result.items ?? []).map((item) => mapDestination(item as RawItem));
  } catch (err) {
    console.error(`[getDestinations] Wix query "${DESTINATIONS_COLLECTION}" failed:`, err);
    return [];
  }
}

/**
 * Fetch a single room by its Wix _id and map to our `Room` type.
 */
export async function getRoomById(id: string): Promise<Room | null> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return null;

  try {
    const res = await client.items
      .query(ROOMS_COLLECTION)
      .eq("_id", id)
      .limit(1)
      .find();
    const item = res.items?.[0] as RawItem | undefined;
    return item ? mapRoom(item) : null;
  } catch (err) {
    console.warn("getRoomById failed:", err);
    return null;
  }
}

/**
 * Fetch rooms filtered by type (e.g. "resort", "airbnb").
 * Returns all matching items sorted by name ascending.
 */
export async function fetchRoomsByType(
  type: string,
): Promise<Room[]> {
  const client = wixClient(await getTenantSiteId());
  if (!client) return [];

  try {
    const result = await client.items
      .query(ROOMS_COLLECTION)
      .eq("type", type)
      .ascending("resortName")
      .find();

    return (result.items ?? []).map((item) => mapRoom(item as RawItem));
  } catch (err) {
    console.error(`[fetchRoomsByType] Failed for type="${type}":`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

const TESTIMONIALS_COLLECTION = "Testimonials";

export interface WixTestimonial {
  _id: string;
  /** CMS field: Name */
  name: string;
  /** CMS field: Avatar (Wix image URL or data URI) */
  avatar: string;
  /** CMS field: Text (mapped from "Text" column) */
  quote: string;
  /** CMS field: Date (formatted as "Month YYYY") */
  date?: string;
  /** CMS field: TourRef (_id of the referenced tour) */
  tourRef?: string;
  /** CMS field: featured */
  featured: boolean;
  /** CMS field: cover — optional hero cover image for the testimonial */
  cover?: WixImage;
  /** CMS field: tourName — human-readable tour name for display */
  tourName?: string;
}

function mapTestimonial(item: RawItem): WixTestimonial {
  // CMS column "Text" → Wix API returns as `text`
  const rawQuote =
    (item.text as string) ??
    (item.Text as string) ??
    "";

  // Wix Date fields come back as ISO strings or date strings like "2023-11-15"
  const rawDate = item.date;
  let date: string | undefined;
  if (rawDate) {
    try {
      date = new Date(rawDate as string).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      date = String(rawDate);
    }
  }

  // TourRef is a Wix reference field — resolve to the referenced item's _id
  const rawRef = item.tourRef ?? item.TourRef;
  const tourRef: string | undefined =
    typeof rawRef === "string"
      ? rawRef
      : typeof rawRef === "object" && rawRef !== null
        ? ((rawRef as Record<string, unknown>)._id as string)
        : undefined;

  // Avatar: may be a data URI, a wix:image:// ref, or a plain URL
  const rawAvatar = (item.avatar as string) ?? "";
  const avatar =
    rawAvatar.startsWith("data:") || rawAvatar.startsWith("http")
      ? rawAvatar
      : getWixImageUrl(rawAvatar);

  // Cover image — optional hero image for the testimonial
  const rawCover =
    (item.cover as Record<string, unknown> | string | undefined) ??
    (item.coverImage as Record<string, unknown> | string | undefined);
  const cover = rawCover ? mapWixImage(rawCover) : undefined;

  return {
    _id: (item._id as string) ?? "",
    name: (item.name as string) ?? "",
    avatar,
    quote: rawQuote,
    date,
    tourRef,
    featured: (item.featured as boolean) ?? false,
    cover,
    tourName: (item.tourName as string) ?? undefined,
  };
}

/**
 * Fetch testimonials from the Wix CMS "Testimonials" collection.
 * Supports filtering by `featured === true` and/or `tourRef` (tour _id).
 * Returns featured-first, sorted by _createdDate descending.
 * Falls back to [] on any error so the page never crashes.
 */
export async function fetchTestimonials(
  limit = 6,
  options?: { featuredOnly?: boolean; tourId?: string },
): Promise<WixTestimonial[]> {
  const client = wixCmsAdminClient(await getTenantSiteId()) ?? wixClient(await getTenantSiteId());
  if (!client) return [];

  try {
    let query = client.items
      .query(TESTIMONIALS_COLLECTION)
      .descending("_createdDate")
      .limit(limit);

    if (options?.featuredOnly) {
      query = query.eq("featured", true);
    }
    if (options?.tourId) {
      query = query.eq("tourRef", options.tourId);
    }

    const res = await query.find();

    const items = (res.items ?? []) as RawItem[];
    const mapped = items.map(mapTestimonial).filter((t) => t.name && t.quote);

    // Featured items bubble to the top
    mapped.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return mapped;
  } catch (err) {
    console.warn("[fetchTestimonials] Wix query failed:", err);
    return [];
  }
}
