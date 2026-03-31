import { Suspense } from "react";
import {
  CTASection,
  DestinationsPreview,
  FeaturedTours,
  HeroVideoParallax,
  ParallaxBand,
  PartnerLogosSection,
  TestimonialsSection,
} from "@/components/sections";
import { homepageContent } from "@/mocks/homepage";

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
      <HeroVideoParallax content={homepageContent.hero} />

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

      <ParallaxBand>
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-diamond/80 sm:text-base">
          Curated moments designed with cinematic depth
        </p>
      </ParallaxBand>

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

      <TestimonialsSection items={homepageContent.testimonials} />

      <PartnerLogosSection items={homepageContent.partnerLogos} />

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      <CTASection />
    </main>
  );
}
