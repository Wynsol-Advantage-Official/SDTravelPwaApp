import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTourBySlug, getAllTourSlugs } from "@/lib/wix/tours";
import { generateTourMetadata } from "@/lib/utils/seo";
import { resolveRoomImages, getTestimonials } from "@/lib/services/tours.service";
import { TourDetails } from "@/components/tours/TourDetails";

// ---------------------------------------------------------------------------
// /tours/[slug] — Individual Tour Detail Page
// ---------------------------------------------------------------------------
// - Pre-rendered at build time via generateStaticParams()
// - ISR revalidation every 300 seconds (5 minutes)
// - SEO metadata pulled directly from Wix CMS fields
// ---------------------------------------------------------------------------

export const revalidate = 300;

interface TourPageProps {
  params: Promise<{ slug: string }>;
}

// ── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: TourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getTourBySlug(slug);

  if (!result) {
    return { title: "Tour Not Found" };
  }

  return generateTourMetadata({
    title: result.tour.title,
    slug: result.tour.slug,
    seoTitle: result.tour.seoTitle,
    seoDescription: result.tour.seoDescription,
    heroImageSrc: result.tour.heroImage.src,
  });
}

// ── JSON-LD Structured Data ──────────────────────────────────────────────────

function TourJsonLd({ tour }: { tour: NonNullable<Awaited<ReturnType<typeof getTourBySlug>>>["tour"] }) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanddiamonds.travel";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.seoDescription || tour.summary,
    url: `${siteUrl}/tours/${tour.slug}`,
    image: tour.heroImage.src,
    touristType: "Luxury",
    offers: {
      "@type": "Offer",
      price: tour.startingPrice,
      priceCurrency: tour.currency,
      availability: "https://schema.org/InStock",
    },
    provider: {
      "@type": "TravelAgency",
      name: "Sand Diamonds Travel",
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ── Page Component ───────────────────────────────────────────────────────────

export default async function TourDetailPage({ params }: TourPageProps) {
  const { slug } = await params;
  const result = await getTourBySlug(slug);

  if (!result) {
    notFound();
  }

  const { tour, itinerary, destination, rooms } = result;

  // Resolve missing room images server-side
  const remoteRoomImages = rooms.length > 0
    ? await resolveRoomImages(rooms)
    : {};

  // Fetch tour-specific testimonials from Wix CMS
  const testimonials = await getTestimonials(6, { tourId: tour._id });

  return (
    <>
      <TourJsonLd tour={tour} />
      <TourDetails tour={tour} itinerary={itinerary} destination={destination} rooms={rooms} remoteRoomImages={remoteRoomImages} testimonials={testimonials} />
    </>
  );
}
