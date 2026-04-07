import { BentoGrid } from "@/components/bento";
import { AdBentoCard } from "./AdBentoCard";
import type { Ad } from "@/types/ad";

interface AdBentoStripProps {
  ads: Ad[];
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center rounded-[14px] border border-khaki/30 bg-white p-10 dark:border-white/10 dark:bg-ocean-card">
      <p className="font-sans text-[13px] text-ocean-deep/60 dark:text-white/60">
        Check back soon for special offers.
      </p>
    </div>
  );
}

/**
 * Renders a responsive bento grid of AdBentoCards.
 *
 * Layout:
 *   - 1 ad  → full width
 *   - 2 ads → equal 2-column grid
 *   - 3 ads → desktop: featured left (span-2-rows) + 2 right; tablet: 2-col with first spanning; mobile: stacked
 */
export function AdBentoStrip({ ads }: AdBentoStripProps) {
  if (ads.length === 0) return <EmptyState />;

  if (ads.length === 1) {
    return (
      <AdBentoCard ad={ads[0]} featured className="h-[280px] md:h-[340px]" />
    );
  }

  if (ads.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2">
        <AdBentoCard ad={ads[0]} featured />
        <AdBentoCard ad={ads[1]} />
      </div>
    );
  }

  // 3+ ads
  return (
    <>
      {/* Desktop: featured left spanning 2 rows + 2 stacked right */}
      <div className="hidden lg:block">
        <BentoGrid columns="1fr 1fr" gap={10}>
          <AdBentoCard
            ad={ads[0]}
            featured
            style={{ gridRow: "span 2" }}
            className="h-full"
          />
          <AdBentoCard ad={ads[1]} />
          <AdBentoCard ad={ads[2]} />
        </BentoGrid>
      </div>

      {/* Tablet: first spans full width, rest in 2-column */}
      <div className="hidden md:block lg:hidden">
        <BentoGrid columns="repeat(2, 1fr)" gap={10}>
          <AdBentoCard
            ad={ads[0]}
            featured
            style={{ gridColumn: "span 2" }}
            className="h-[280px]"
          />
          {ads.slice(1, 3).map((ad) => (
            <AdBentoCard key={ad._id} ad={ad} />
          ))}
        </BentoGrid>
      </div>

      {/* Mobile: single column */}
      <div className="grid grid-cols-1 gap-[10px] md:hidden">
        {ads.slice(0, 3).map((ad, i) => (
          <AdBentoCard key={ad._id} ad={ad} featured={i === 0} />
        ))}
      </div>
    </>
  );
}
