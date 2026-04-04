// ---------------------------------------------------------------------------
// Ads Wix Data Layer
// ---------------------------------------------------------------------------
// Fetches from the Wix CMS "ads" collection and maps raw items to Ad types.
// Server-only via the wixClient() import chain.
// ---------------------------------------------------------------------------

import { wixClient } from "./client";
import { getWixImageUrl, getWixImageDimensions } from "./media";
import type { Ad } from "@/types/ad";
import type { WixImage } from "@/types/tour";

const ADS_COLLECTION = "ads";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawItem = Record<string, any>;

function mapWixImage(raw: Record<string, unknown> | string | undefined): WixImage {
  if (!raw) return { src: "/og/default.jpg", width: 1200, height: 675, alt: "" };

  if (typeof raw === "string") {
    const dims = getWixImageDimensions(raw);
    return { src: getWixImageUrl(raw), width: dims.width, height: dims.height, alt: "" };
  }

  const src = (raw.src as string) ?? (raw.url as string) ?? "";
  const dims = getWixImageDimensions(src);
  return {
    src: getWixImageUrl(src),
    width: (raw.width as number) ?? dims.width,
    height: (raw.height as number) ?? dims.height,
    alt: (raw.alt as string) ?? (raw.title as string) ?? "",
  };
}

/**
 * Map a single Wix Media Gallery item.
 * Wix wraps each gallery entry in an `image` sub-property; handle both shapes.
 */
function mapMediaGalleryItem(item: unknown): WixImage {
  if (!item) return { src: "/og/default.jpg", width: 1200, height: 675, alt: "" };

  const raw = item as Record<string, unknown>;

  // Wix Media Gallery: { type: "image", image: { url: "wix:image://..." } }
  if (raw.image) {
    return mapWixImage(raw.image as Record<string, unknown> | string);
  }

  // Legacy / direct image object
  return mapWixImage(raw);
}

function mapAd(item: RawItem): Ad {
  const gallery: WixImage[] = Array.isArray(item.mediaGallery)
    ? (item.mediaGallery as unknown[]).map(mapMediaGalleryItem)
    : [];

  const cover =
    (item.cover != null
      ? mapWixImage(item.cover as Record<string, unknown> | string)
      : null) ??
    (item.coverImage != null
      ? mapWixImage(item.coverImage as Record<string, unknown> | string)
      : null) ??
    gallery[0] ??
    { src: "/og/default.jpg", width: 1200, height: 675, alt: "" };

  return {
    _id: (item._id as string) ?? "",
    title: (item.title as string) ?? "",
    cover,
    mediaGallery: gallery,
    active: (item.active as boolean) ?? false,
    href:
      (item.link as string) ??
      (item.href as string) ??
      (item.url as string) ??
      undefined,
  };
}

/**
 * Fetch ads from the Wix CMS "ads" collection.
 *
 * @param options.activeOnly - If true, only return ads where active === true (default false)
 * @param options.limit      - Max number of results to return
 */
export async function getAds(options?: {
  activeOnly?: boolean;
  limit?: number;
}): Promise<Ad[]> {
  const client = wixClient();
  if (!client) return [];

  try {
    let query = client.items.query(ADS_COLLECTION);

    if (options?.activeOnly) {
      query = query.eq("active", true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const result = await query.find();
    return (result.items ?? []).map((item) => mapAd(item as RawItem));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[getAds] Wix query failed for collection '${ADS_COLLECTION}':`,
      msg,
    );
    return [];
  }
}
