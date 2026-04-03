import { fetchAccommodation } from "@/lib/api/wix"
import { fetchTestimonials, fetchAccommodationsByType } from "@/lib/wix/tours"
import type { Accommodation } from "@/types/tour"
export type { WixTestimonial } from "@/lib/wix/tours"

/**
 * Resolve missing accommodation images by fetching from Wix API.
 * Returns a map of accommodation _id → { src, alt }.
 */
export async function resolveAccommodationImages(
  accommodations: Accommodation[],
): Promise<Record<string, { src: string; alt?: string }>> {
  const DEFAULT_SRC = "/og/default.jpg"
  const results: Record<string, { src: string; alt?: string }> = {}

  const missing = accommodations.filter((acc) => {
    const hasLocal =
      (acc.image?.src && acc.image.src !== DEFAULT_SRC) ||
      (acc.gallery && acc.gallery.length > 0 && acc.gallery[0].src && acc.gallery[0].src !== DEFAULT_SRC)
    return !hasLocal && acc._id
  })

  await Promise.allSettled(
    missing.map(async (acc) => {
      const found = await fetchAccommodation(acc._id)
      if (found?.image?.src) {
        results[acc._id] = { src: found.image.src, alt: found.image.alt }
      }
    }),
  )

  return results
}

/**
 * Retrieve testimonials from Wix CMS, normalised for the TestimonialCarousel.
 * Supports filtering by featured status and/or tour reference.
 * Returns an empty array on failure — the carousel shows its fallback state.
 */
export async function getTestimonials(
  limit = 6,
  options?: { featuredOnly?: boolean; tourId?: string },
) {
  return fetchTestimonials(limit, options)
}

/**
 * Fetch accommodations by property type from Wix CMS.
 * Pass "resort" for hotels, "airbnb" for Airbnbs, etc.
 */
export async function getAccommodationsByType(
  type: string,
): Promise<Accommodation[]> {
  return fetchAccommodationsByType(type)
}
