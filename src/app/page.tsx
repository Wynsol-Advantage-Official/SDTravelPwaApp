import {
  LuxuryHero,
  LuxuryDestinations,
  LuxuryToursStats,
  LuxuryWhyUs,
  LuxuryAds,
  LuxuryTestimonials,
  LuxuryInsights,
  LuxuryPartnersCta,
} from "@/components/sections";
import { HomeMotionConfig } from "@/components/motion";

// ---------------------------------------------------------------------------
// Homepage — Server Component (default)
// ---------------------------------------------------------------------------
// Dark luxury bento homepage with five sections rendered in order.
// ---------------------------------------------------------------------------

// force-dynamic: section components (LuxuryDestinations, LuxuryToursStats, LuxuryAds,
// LuxuryTestimonials) all call Wix via getTenantSiteId() which reads x-wix-site-id from
// request headers. ISR background revalidation runs without a request context on Vercel,
// causing the header to be missing and all sections to fall back to www data.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="relative mx-0.5 min-h-dvh bg transition-colors duration-300 dark:bg-ocean-deep">
      <HomeMotionConfig>
        <LuxuryHero />
        <div className="mt-6"><LuxuryDestinations /></div>
        <div className="mt-6"><LuxuryToursStats /></div>
        <div className="mt-6"><LuxuryWhyUs /></div>
        <div className="mt-6"><LuxuryAds /></div>
        <div className="mt-6"><LuxuryTestimonials /></div>
        <div className="mt-6"><LuxuryInsights /></div>
        <div className="mt-6"><LuxuryPartnersCta /></div>
      </HomeMotionConfig>
    </main>
  );
}
