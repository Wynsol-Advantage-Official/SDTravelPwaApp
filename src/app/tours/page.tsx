import type { Metadata } from "next";
import { getTours } from "@/lib/wix/tours";
import { TourCard } from "@/components/tours/TourCard";
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide";

// ---------------------------------------------------------------------------
// /tours — Tour Listing Page (Server Component, ISR every 60s)
// ---------------------------------------------------------------------------

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Luxury Tours",
  description:
    "Browse our handcrafted collection of luxury travel experiences — " +
    "from Caribbean beach escapes to African safari adventures.",
};

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <main className="min-h-dvh bg-diamond">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <section className="bg-charcoal px-6 pb-16 pt-24 text-center">
        <FadeSlide>
          <FadeSlideChild>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              Curated Collection
            </p>
          </FadeSlideChild>
          <FadeSlideChild>
            <h1 className="font-serif text-4xl font-bold text-diamond sm:text-5xl">
              Our Diamond Tours
            </h1>
          </FadeSlideChild>
          <FadeSlideChild>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-diamond/70">
              Each journey is a masterpiece — meticulously designed, personally
              curated, and delivered with concierge-level attention.
            </p>
          </FadeSlideChild>
        </FadeSlide>
      </section>

      {/* ── Tour Grid ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {tours.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour, index) => (
              <TourCard
                key={tour._id || tour.slug}
                tour={tour}
                priority={index < 3}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-charcoal/50">
              New diamonds are being polished. Check back soon.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
