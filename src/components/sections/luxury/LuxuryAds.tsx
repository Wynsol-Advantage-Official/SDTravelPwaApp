import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { AdBentoStrip } from "@/components/ads";
import { getActiveAds } from "@/lib/services/ads.service";

// ---------------------------------------------------------------------------
// LuxuryAds — Server Component
// ---------------------------------------------------------------------------
// Fetches active ads from Wix CMS and presents them in the bento card design
// style. Renders nothing when there are no active ads so the page stays clean.
// ---------------------------------------------------------------------------

export async function LuxuryAds() {
  const ads = await getActiveAds(3);

  // Silently omit the section when there are no active ads
  if (ads.length === 0) return null;

  return (
    <section aria-labelledby="luxury-ads-heading" className="mt-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-ocean dark:text-blue-chill">
              Featured Promotions
            </p>
            <h2
              id="luxury-ads-heading"
              className="mt-1 font-sans text-[22px] text-ocean-deep transition-colors duration-300 dark:text-white"
            >
              Special{" "}
              <em className="italic text-ocean dark:text-blue-chill-300">
                Offers
              </em>
            </h2>
          </div>
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-ocean transition-colors hover:text-ocean-deep dark:text-blue-chill-300 dark:hover:text-blue-chill"
          >
            Explore All{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      {/* ── Bento ad grid ──────────────────────────────────────────── */}
      <Reveal delayMs={100}>
        <AdBentoStrip ads={ads} />
      </Reveal>
    </section>
  );
}
