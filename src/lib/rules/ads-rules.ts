// ---------------------------------------------------------------------------
// Ads Business Rules (pure — no async, no external imports)
// ---------------------------------------------------------------------------

import type { Ad } from "@/types/ad";

/**
 * Filter to active ads and limit to `max` items for display.
 * Preserves the original ordering from the CMS.
 */
export function selectAdsToDisplay(ads: Ad[], max: number): Ad[] {
  return ads.filter((ad) => ad.active).slice(0, max);
}

/**
 * Determine the bento layout variant based on ad count.
 */
export function getAdLayoutVariant(
  count: number,
): "single" | "double" | "triple" {
  if (count <= 1) return "single";
  if (count === 2) return "double";
  return "triple";
}

/**
 * Format a raw CMS ad title into a human-readable display string.
 *
 * Examples:
 *   "negril-ads"        → "Negril"
 *   "summer_deals_2026" → "Summer Deals 2026"
 *   "Beach Promo"       → "Beach Promo"
 */
export function formatAdTitle(raw: string): string {
  return raw
    .replace(/[-_\s]ads?$/i, "")   // strip trailing "-ads", "_ad", " ads" etc.
    .replace(/[-_]/g, " ")          // replace hyphens/underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // title-case
    .trim();
}
