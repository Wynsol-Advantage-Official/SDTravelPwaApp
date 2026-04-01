import {
  LuxuryHero,
  LuxuryDestinations,
  LuxuryToursStats,
  LuxuryTestimonials,
  LuxuryPartnersCta,
} from "@/components/sections";

// ---------------------------------------------------------------------------
// Homepage — Server Component (default)
// ---------------------------------------------------------------------------
// Dark luxury bento homepage with five sections rendered in order.
// ---------------------------------------------------------------------------

export const revalidate = 60;

export default function HomePage() {
  return (
    <main className="relative min-h-dvh bg-tan-50 transition-colors duration-300 dark:bg-ocean-deep">
      <LuxuryHero />
      <div className="mt-6"><LuxuryDestinations /></div>
      <div className="mt-6"><LuxuryToursStats /></div>
      <div className="mt-6"><LuxuryTestimonials /></div>
      <div className="mt-6"><LuxuryPartnersCta /></div>
    </main>
  );
}
