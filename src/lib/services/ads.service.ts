// ---------------------------------------------------------------------------
// Ads Service — orchestrates Wix data access for ads
// ---------------------------------------------------------------------------
// This is the only file hooks/pages should import for ad data.
// All Wix calls are encapsulated in @/lib/wix/ads.
// ---------------------------------------------------------------------------

import { getAds } from "@/lib/wix/ads";
import { selectAdsToDisplay } from "@/lib/rules/ads-rules";
import type { Ad } from "@/types/ad";

/**
 * Fetch active ads for display, limited to `max` items.
 * Applies active-only filter at the service + rules layer.
 * Returns an empty array on failure — callers should render a null/empty state.
 *
 * @param max - Maximum number of ads to return (default 3)
 */
export async function getActiveAds(max = 3): Promise<Ad[]> {
  // Fetch slightly more than needed so the rules layer can filter duplicates
  // or inactive items that slipped through a Wix query cache.
  const ads = await getAds({ activeOnly: true, limit: max * 2 });
  return selectAdsToDisplay(ads, max);
}
