import Link from "next/link";
import { getTours } from "@/lib/wix/tours";
import { TourCard } from "@/components/tours/TourCard";

// ---------------------------------------------------------------------------
// FeaturedTours — Server Component section for the homepage
// ---------------------------------------------------------------------------
// Fetches featured tours from Wix CMS and renders a grid of TourCards.
// This is a Server Component — no 'use client' needed. The TourCards are
// client components for hover interactions, but the data fetch is server-side.
// ---------------------------------------------------------------------------

export async function FeaturedTours() {
  const tours = await getTours({ featuredOnly: true });

  if (tours.length === 0) return null;

  return (
    <section className="bg-diamond px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
            Handpicked for You
          </p>
          <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
            Featured Diamonds
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-charcoal/60">
            Our most sought-after journeys — curated for travelers who expect
            nothing less than extraordinary.
          </p>
        </div>

        {/* Tour grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.slice(0, 6).map((tour, index) => (
            <TourCard
              key={tour._id || tour.slug}
              tour={tour}
              priority={index < 3}
            />
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/tours"
            className="inline-flex h-12 items-center rounded-sm border border-charcoal/20 px-8 text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:border-gold hover:text-gold"
          >
            View All Tours
          </Link>
        </div>
      </div>
    </section>
  );
}
