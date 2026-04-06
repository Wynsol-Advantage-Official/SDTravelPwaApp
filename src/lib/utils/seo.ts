import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// SEO Helpers
// ---------------------------------------------------------------------------

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanddiamonds.travel";

interface TourMetaInput {
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  heroImageSrc?: string;
}

/**
 * Generate `Metadata` for an individual tour page.
 */
export function generateTourMetadata(tour: TourMetaInput): Metadata {
  const title = tour.seoTitle || `${tour.title} | Luxury Tour`;
  const description =
    tour.seoDescription ||
    `Experience the luxury of ${tour.title} with Sand Diamonds Travel.`;
  const url = `${siteUrl}/tours/${tour.slug}`;
  const image = tour.heroImageSrc || "/og/default.jpg";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: tour.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

interface DestinationMetaInput {
  name: string;
  region: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  heroImageSrc?: string;
}

/**
 * Generate `Metadata` for a destination hub page.
 */
export function generateDestinationMetadata(
  dest: DestinationMetaInput
): Metadata {
  const title = dest.seoTitle || `${dest.name} Luxury Holidays`;
  const description =
    dest.seoDescription ||
    `Discover luxury travel in ${dest.name}, ${dest.region}. Handcrafted by Sand Diamonds.`;
  const url = `${siteUrl}/destinations/${dest.slug}`;
  const image = dest.heroImageSrc || "/og/default.jpg";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: dest.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
