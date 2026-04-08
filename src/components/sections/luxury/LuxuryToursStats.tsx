import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { BentoGrid, BentoCard, StatCard } from "@/components/bento";
import { Reveal } from "@/components/motion";
import { getTours } from "@/lib/wix/tours";
import type { Tour } from "@/types/tour";

/* ------------------------------------------------------------------ */
/*  Tour card                                                          */
/* ------------------------------------------------------------------ */

function TourCard({
  tour,
  featured = false,
  className = "",
  style,
}: {
  tour: Tour;
  featured?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const minHeight = featured ? "h-full" : "min-h-[220px]";
  const titleSize = featured ? "text-[22px]" : "text-[18px]";
  const descClamp = featured ? "line-clamp-3" : "line-clamp-2";

  let price: string;
  try {
    price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: tour.currency,
      maximumFractionDigits: 0,
    }).format(tour.startingPrice);
  } catch {
    price = `$${tour.startingPrice.toLocaleString()}`;
  }

  const duration = `${tour.duration} Night${tour.duration !== 1 ? "s" : ""}`;
  // Combine tour highlights with any destination-level tags (if present),
  // remove duplicates and limit to first 3 tags for the card.
  const destTags: string[] = (tour as any)?.destination?.tags ?? (tour as any)?.destination?.highlights ?? [];
  const combined = [...(tour.highlights ?? []), ...destTags];
  const unique: string[] = Array.from(new Set(combined));
  const tags = unique.slice(0, 3);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={[
        "group relative flex flex-col overflow-hidden",
        "rounded-[14px] border border-khaki/30 bg-white dark:border-white/10 dark:bg-ocean-card",
        "transition-[transform,border-color] duration-[220ms] ease-out",
        "hover:-translate-y-[2px] hover:border-ocean/40 dark:hover:border-blue-chill/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ocean-deep",
        minHeight,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Background image with cover + scrim (covers entire card) */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src={tour.heroImage.src}
          alt={tour.heroImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div
          className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 via-ocean-deep/30 to-transparent"
          aria-hidden="true"
        />

        {/* Price badge */}
        <span className="absolute right-3 top-3 rounded-[8px] bg-ocean-deep/80 px-2.5 py-1 font-sans text-[12px] font-semibold text-blue-chill-300 backdrop-blur-sm">
          From {price}
        </span>

        {/* Destination tag */}
        <span className="absolute left-3 top-3 rounded-[8px] border border-blue-chill/30 bg-blue-chill/10 px-2.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-chill-300">
          {tour.destination.name}
        </span>

      </div>

      {/* Content overlay — covers entire card, justifies content to bottom */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-[18px]">
        <h3 className={`font-sans font-bold text-white ${titleSize}`}>
          {tour.title}
        </h3>

        {featured && (
          <p className={`mt-1 font-sans text-[13px] text-white/60 ${descClamp}`}>
            {tour.summary || tour.description}
          </p>
        )}

        {/* Tags row */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[6px] border border-white/10 bg-ocean-deep/50 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 font-sans text-[11px] text-white/60">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {duration}
          </div>
          <span className="inline-flex items-center gap-1 font-sans text-[12px] font-semibold text-blue-chill-300 transition-colors group-hover:text-blue-chill">
            View Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat row data                                                      */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: "340+", label: "Destinations" },
  { value: "4200+", label: "Happy Guests" },
  { value: "98%", label: "Satisfaction" },
  { value: "15+", label: "Years of Excellence" },
];

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <BentoCard
      variant="default"
      className="col-span-full flex flex-col items-center justify-center p-10 text-center"
    >
      <h3 className="font-sans text-[20px] text-ocean-deep dark:text-white">
        Tours are being refreshed
      </h3>
      <p className="mt-2 max-w-[42ch] font-sans text-[13px] leading-[1.55] text-ocean-deep/60 dark:text-white/60">
        Our concierge team is curating new tours for you. In the meantime,
        browse our destinations or reach out.
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 rounded-[8px] bg-ocean px-4 py-2 text-[12px] font-semibold uppercase text-ocean-deep transition-[transform,background-color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:bg-blue-chill"
        >
          Browse Tours
        </Link>
      </div>
    </BentoCard>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryToursStats section (server component)                        */
/* ------------------------------------------------------------------ */

export async function LuxuryToursStats() {
  const allTours = await getTours({ featuredOnly: true, activeOnly: true });
  const tours = allTours.slice(0, 3);

  return (
    <section aria-labelledby="luxury-tours-stats-heading" className="mt-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-ocean dark:text-blue-chill">
              Handpicked Experiences
            </p>
            <h2 id="luxury-tours-stats-heading" className="mt-1 font-sans text-[22px] text-ocean-deep transition-colors duration-300 dark:text-white">
              Luxury <em className="italic text-ocean dark:text-blue-chill-300">Tours</em>
            </h2>
          </div>
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-ocean transition-colors hover:text-ocean-deep dark:text-blue-chill-300 dark:hover:text-blue-chill"
          >
            View all tours{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      {/* ── Tour cards grid ────────────────────────────────────────── */}
      <Reveal delayMs={100}>
        {tours.length === 0 ? (
          <EmptyState />
        ) : tours.length >= 3 ? (
          <>
            {/* Desktop: featured left + 2 standard right */}
            <div className="hidden lg:block">
              <BentoGrid columns="1fr 1fr" gap={10}>
                {/* Featured tour — full left column */}
                <TourCard
                  tour={tours[0]}
                  featured
                  style={{ gridRow: "span 2" }}
                  className="h-full"
                />
                {/* Standard tour 1 */}
                <TourCard tour={tours[1]} />
                {/* Standard tour 2 */}
                <TourCard tour={tours[2]} />
              </BentoGrid>
            </div>

            {/* Tablet: 2-column grid */}
            <div className="hidden md:block lg:hidden">
              <BentoGrid columns="repeat(2, 1fr)" gap={10}>
                <TourCard
                  tour={tours[0]}
                  featured
                  style={{ gridColumn: "span 2" }}
                />
                {tours.slice(1).map((tour) => (
                  <TourCard key={tour.slug} tour={tour} />
                ))}
              </BentoGrid>
            </div>

            {/* Mobile: single column stack */}
            <div className="grid grid-cols-1 gap-[10px] md:hidden">
              {tours.map((tour, i) => (
                <TourCard key={tour.slug} tour={tour} featured={i === 0} />
              ))}
            </div>
          </>
        ) : (
          /* 1–2 tours: safe fallback grid with .map() */
          <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2">
            {tours.map((tour, i) => (
              <TourCard key={tour.slug} tour={tour} featured={i === 0} />
            ))}
          </div>
        )}
      </Reveal>

      {/* ── Stat row ───────────────────────────────────────────────── */}
      <Reveal delayMs={200}>
        <div className="mt-[10px]">
          <BentoGrid
            columns={`repeat(${STATS.length}, 1fr)`}
            gap={10}
            className="hidden sm:grid"
          >
            {STATS.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </BentoGrid>

          {/* Mobile: 2-column stat grid */}
          <div className="grid grid-cols-2 gap-[10px] sm:hidden">
            {STATS.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
