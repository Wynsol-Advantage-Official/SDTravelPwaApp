import { useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface HeroImage {
  src: string;
  alt?: string;
}

/** Shape of a raw Wix Ads CMS item as returned by /api/ads/list */
export interface RawHeroAd {
  title?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  badge?: string;
  slug?: string;
  href?: string;
  cover?: { src: string; alt?: string };
  mediaGallery?: Array<{ src: string; alt?: string }>;
  // Wix CMS fields vary per tenant — allow additional keys
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HeroDeal {
  title: string;
  subtitle: string;
  badge?: string;
  price?: string;
  originalPrice?: string;
  highlights: string[];
  href: string;
  imgSrc: string;
  imgAlt: string;
}

/* ------------------------------------------------------------------ */
/*  Fallback content keyed by image alt text                           */
/* ------------------------------------------------------------------ */

type DealPartial = Partial<Omit<HeroDeal, "imgSrc" | "imgAlt">>;

const FALLBACK_BY_ALT: Record<string, DealPartial> = {
  "Luxury beach": {
    title: "Caribbean Beach Escape",
    subtitle: "7 nights of sun, sand & sea — all-inclusive luxury",
    badge: "Hot Deal",
    price: "From $2,499",
    originalPrice: "$3,200",
    highlights: ["All-inclusive resort", "Private beach access", "Spa credit included"],
    href: "/tours?theme=Beach+%26+Sea",
  },
  "Mountain view": {
    title: "Alpine Luxury Retreat",
    subtitle: "Discover panoramic peaks and cosy mountain lodges",
    badge: "Limited Spots",
    price: "From $1,899",
    originalPrice: "$2,400",
    highlights: ["Boutique mountain lodge", "Guided hiking tours", "Gourmet dining"],
    href: "/tours?theme=Adventure",
  },
  "City skyline": {
    title: "City Diamond Collection",
    subtitle: "Curated urban luxury — top hotels, culture & gastronomy",
    badge: "Exclusive",
    price: "From $1,299",
    highlights: ["5-star hotel stay", "Concierge service", "Cultural excursions"],
    href: "/tours?theme=Culture",
  },
};

const DEFAULT_DEAL: Omit<HeroDeal, "imgSrc" | "imgAlt"> = {
  title: "Luxury Travel Deal",
  subtitle: "Exclusive offer — limited availability",
  badge: "Special Offer",
  price: "From $999",
  highlights: ["Handpicked destinations", "Concierge support", "Flexible booking"],
  href: "/tours",
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Derives sales-panel deal data for the currently highlighted hero slide.
 *
 * Priority order:
 *  1. Raw Wix ad metadata for that index (title, description, price…)
 *  2. Static fallback keyed by the image's `alt` text
 *  3. Generic default copy
 */
export function useHeroDeal(
  index: number,
  imageList: readonly HeroImage[],
  rawAds?: RawHeroAd[] | null,
): HeroDeal | null {
  return useMemo(() => {
    if (!imageList.length) return null;

    const img = imageList[index % imageList.length];
    const ad = rawAds?.[index];

    if (ad) {
      return {
        title: ad.title ?? DEFAULT_DEAL.title,
        subtitle: ad.description ?? DEFAULT_DEAL.subtitle,
        badge: ad.badge,
        price: ad.price,
        originalPrice: ad.originalPrice,
        highlights: DEFAULT_DEAL.highlights,
        href: ad.href ?? (ad.slug ? `/tours/${ad.slug}` : DEFAULT_DEAL.href),
        imgSrc: img.src,
        imgAlt: img.alt ?? ad.title ?? "Deal image",
      };
    }

    const fallback: DealPartial = (img.alt != null ? FALLBACK_BY_ALT[img.alt] : undefined) ?? {};

    return {
      ...DEFAULT_DEAL,
      ...fallback,
      imgSrc: img.src,
      imgAlt: img.alt ?? "Deal image",
    } as HeroDeal;
  }, [index, imageList, rawAds]);
}
