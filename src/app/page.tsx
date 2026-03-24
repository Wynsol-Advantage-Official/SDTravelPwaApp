import { Suspense } from "react";
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide";
import { FeaturedTours } from "@/components/sections/FeaturedTours";
import { DestinationsPreview } from "@/components/sections/DestinationsPreview";
import { CTASection } from "@/components/sections/CTASection";

// ---------------------------------------------------------------------------
// Homepage — Server Component (default)
// ---------------------------------------------------------------------------
// The hero section renders immediately via SSR for optimal LCP.
// Framer Motion animations are handled by the thin <FadeSlide> client wrapper,
// keeping the actual content in the Server Component for SEO & performance.
// ---------------------------------------------------------------------------

export const revalidate = 60;

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col">
      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-charcoal">
        {/* Gradient overlay — ensures text readability on any hero image */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/30 to-charcoal/80" />

        <FadeSlide className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <FadeSlideChild>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-gold">
              Bespoke Concierge Travel
            </p>
          </FadeSlideChild>

          <FadeSlideChild>
            <h1 className="font-serif text-5xl font-bold leading-tight text-diamond sm:text-6xl lg:text-7xl">
              Where Every Journey
              <br />
              <span className="text-sand">Becomes a Diamond</span>
            </h1>
          </FadeSlideChild>

          <FadeSlideChild>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-diamond/80">
              Handcrafted luxury itineraries, curated by experts who believe
              your travel experience should be as rare and brilliant as a
              diamond.
            </p>
          </FadeSlideChild>

          <FadeSlideChild>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/tours"
                className="inline-flex h-14 items-center rounded-sm bg-gold px-8 text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:bg-gold-400 focus-visible:ring-2 focus-visible:ring-gold"
              >
                Explore Diamonds
              </a>
              <a
                href="/dashboard/chat"
                className="inline-flex h-14 items-center rounded-sm border border-diamond/30 px-8 text-sm font-semibold uppercase tracking-wider text-diamond transition-colors hover:border-gold hover:text-gold"
              >
                Speak to a Concierge
              </a>
            </div>
          </FadeSlideChild>
        </FadeSlide>
      </section>

      {/* ── Featured Tours Section ──────────────────────────────────────── */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <p className="font-serif text-lg text-charcoal/40">
              Loading featured diamonds…
            </p>
          </div>
        }
      >
        <FeaturedTours />
      </Suspense>

      {/* ── Destinations Preview ─────────────────────────────────────── */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <p className="font-serif text-lg text-charcoal/40">
              Loading destinations…
            </p>
          </div>
        }
      >
        <DestinationsPreview />
      </Suspense>

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      <CTASection />
    </main>
  );
}
