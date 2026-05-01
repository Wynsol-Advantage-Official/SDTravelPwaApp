// ---------------------------------------------------------------------------
// Articles Wix Data Layer
// ---------------------------------------------------------------------------
// Fetches from the Wix CMS "Articles" collection and maps raw items to the
// Article type. Server-only via the wixClient() import chain.
// ---------------------------------------------------------------------------

import { headers } from "next/headers";
import { wixClient, wixCmsAdminClient } from "./client";
import { getWixImageUrl, getWixImageDimensions } from "./media";
import type { Article } from "@/types/article";
import type { WixImage } from "@/types/tour";

async function getTenantSiteId(): Promise<string | undefined> {
  try {
    const hdrs = await headers();
    return hdrs.get("x-wix-site-id") ?? undefined;
  } catch {
    return undefined;
  }
}

const ARTICLES_COLLECTION = "Articles";

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

function mapMediaGalleryItem(item: unknown): WixImage {
  if (!item) return { src: "/og/default.jpg", width: 1200, height: 675, alt: "" };
  const raw = item as Record<string, unknown>;
  if (raw.image) return mapWixImage(raw.image as Record<string, unknown> | string);
  return mapWixImage(raw);
}

function mapArticle(item: RawItem): Article {
  // Resolve cover image — try coverImage, then cover, then first gallery item
  const galleryRaw: WixImage[] = Array.isArray(item.mediaGallery)
    ? (item.mediaGallery as unknown[]).map(mapMediaGalleryItem)
    : [];

  const cover =
    (item.coverImage != null
      ? mapWixImage(item.coverImage as Record<string, unknown> | string)
      : null) ??
    (item.cover != null
      ? mapWixImage(item.cover as Record<string, unknown> | string)
      : null) ??
    galleryRaw[0] ??
    { src: "/og/default.jpg", width: 1200, height: 675, alt: "" };

  // Normalize publishedDate — accept Date object, ISO string, or null
  let publishedDate: string | null = null;
  const rawDate = item.publishedDate ?? item.date ?? item.createdDate ?? null;
  if (rawDate instanceof Date) {
    publishedDate = rawDate.toISOString();
  } else if (typeof rawDate === "string" && rawDate.length > 0) {
    publishedDate = rawDate;
  }

  return {
    _id: (item._id as string) ?? "",
    title: (item.title as string) ?? "",
    slug: (item.slug as string) ?? (item._id as string) ?? "",
    excerpt: (item.excerpt as string) ?? (item.description as string) ?? null,
    category: (item.category as string) ?? (item.tag as string) ?? null,
    cover,
    author: (item.author as string) ?? null,
    publishedDate,
    readMinutes:
      typeof item.readMinutes === "number"
        ? item.readMinutes
        : typeof item.readTime === "number"
          ? item.readTime
          : null,
    active: (item.active as boolean) ?? true,
    href:
      (item.link as string) ??
      (item.href as string) ??
      (item.url as string) ??
      undefined,
  };
}

/**
 * Fetch articles from the Wix CMS "Articles" collection.
 *
 * @param options.activeOnly - If true, only return articles where active === true
 * @param options.limit      - Max number of results to return
 */
export async function getArticles(options?: {
  activeOnly?: boolean;
  limit?: number;
}): Promise<Article[]> {
  const client = wixCmsAdminClient(await getTenantSiteId()) ?? wixClient(await getTenantSiteId());
  if (!client) return [];

  try {
    let query = client.items.query(ARTICLES_COLLECTION);

    if (options?.activeOnly) {
      query = query.eq("active", true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const result = await query.find();
    return (result.items ?? []).map((item) => mapArticle(item as RawItem));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // WDE0025 = collection does not exist — expected before the CMS collection
    // is created in Wix. Suppress the noisy error and return empty gracefully.
    if (msg.includes("WDE0025") || msg.toLowerCase().includes("does not exist")) {
      return [];
    }
    console.error(
      `[getArticles] Wix query failed for collection '${ARTICLES_COLLECTION}':`,
      msg,
    );
    return [];
  }
}
