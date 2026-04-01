import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/bento";
import { Reveal } from "@/components/motion";
import { getDestinations } from "@/lib/wix/tours";
import type { Destination } from "@/types/tour";

/* ------------------------------------------------------------------ */
/*  Destination card                                                   */
/* ------------------------------------------------------------------ */

type CardVariant = "featured" | "tall" | "standard";

function DestinationCard({
  dest,
  variant,
  style,
  className = "",
}: {
  dest: Destination;
  variant: CardVariant;
  style?: React.CSSProperties;
  className?: string;
}) {
  const titleSize = variant === "featured" ? "text-[20px]" : "text-[18px]";

  return (
    <Link
      href={`/destinations/${dest.slug}`}
      className={[
        "group relative flex flex-col justify-end overflow-hidden",
        "rounded-[14px] border border-khaki/30 bg-white dark:border-white/10 dark:bg-ocean-card",
        "transition-[transform,border-color] duration-[220ms] ease-out",
        "hover:-translate-y-[2px] hover:border-ocean/40 dark:hover:border-blue-chill/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ocean-deep",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Image with hover zoom */}
      <Image
        src={dest.heroImage.src}
        alt={dest.heroImage.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient scrim for text legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 via-ocean-deep/30 to-transparent"
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className="relative z-10 p-[18px]">
        {/* Featured badge */}
        {variant === "featured" && (
          <span className="mb-2 inline-block rounded-[8px] border border-blue-chill/30 bg-blue-chill/10 px-2.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-chill-300">
            Featured
          </span>
        )}

        {/* Region eyebrow */}
        <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-blue-chill-300">
          {dest.region}
        </p>

        {/* Destination name */}
        <h3 className={`mt-1 font-sans font-bold text-white ${titleSize}`}>
          {dest.name}
        </h3>

        {/* Climate descriptor */}
        {dest.climate && (
          <p className="mt-1 font-sans text-[13px] text-white/60">
            {dest.climate}
          </p>
        )}

        {/* CTA arrow */}
        <span className="mt-2 inline-flex items-center gap-1 font-sans text-[12px] font-semibold text-blue-chill-300 transition-colors group-hover:text-blue-chill">
          Explore <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

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
        Destinations are being refreshed
      </h3>
      <p className="mt-2 max-w-[42ch] font-sans text-[13px] leading-[1.55] text-ocean-deep/60 dark:text-white/60">
        Our concierge team is curating new destinations for you. In the
        meantime, explore our tours or reach out.
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 rounded-[8px] bg-ocean px-4 py-2 text-[12px] font-semibold uppercase text-ocean-deep transition-[transform,background-color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:bg-blue-chill"
        >
          Browse Tours
        </Link>
        <Link
          href="/dashboard/chat"
          className="inline-flex items-center gap-2 rounded-[8px] border border-khaki/40 px-4 py-2 text-[12px] font-semibold uppercase text-ocean-deep transition-[transform,border-color,color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:border-ocean/30 hover:text-ocean dark:border-white/10 dark:text-white dark:hover:border-blue-chill/30 dark:hover:text-blue-chill-300"
        >
          Contact Concierge
        </Link>
      </div>
    </BentoCard>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryDestinations section (server component)                      */
/* ------------------------------------------------------------------ */

export async function LuxuryDestinations() {
  const allDestinations = await getDestinations();
  const destinations = allDestinations.slice(0, 5);

  return (
    <section aria-labelledby="luxury-destinations-heading" className="mt-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-ocean dark:text-blue-chill">
              Curated Collection
            </p>
            <h2 id="luxury-destinations-heading" className="mt-1 font-sans text-[22px] text-ocean-deep transition-colors duration-300 dark:text-white">
              Explore{" "}
              <em className="italic text-ocean dark:text-blue-chill-300">Destinations</em>
            </h2>
          </div>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-ocean transition-colors hover:text-ocean-deep dark:text-blue-chill-300 dark:hover:text-blue-chill"
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      {/* ── Bento grid ─────────────────────────────────────────────── */}
      <Reveal delayMs={100}>
        {destinations.length === 0 ? (
          <BentoGrid columns="1fr" gap={10}>
            <EmptyState />
          </BentoGrid>
        ) : (
          <>
            {/* Desktop asymmetric 4-column grid */}
            <div className="hidden lg:block">
              {destinations.length >= 5 ? (
                <BentoGrid columns="repeat(4, 1fr)" rows="280px 220px" gap={10}>
                  {/* Featured — cols 1-2, row 1 */}
                  <DestinationCard
                    dest={destinations[0]}
                    variant="featured"
                    style={{ gridColumn: "span 2" }}
                  />
                  {/* Standard 1 — col 3, row 1 */}
                  <DestinationCard
                    dest={destinations[1]}
                    variant="standard"
                  />
                  {/* Tall — col 4, rows 1-2 */}
                  <DestinationCard
                    dest={destinations[2]}
                    variant="tall"
                    style={{ gridRow: "span 2" }}
                  />
                  {/* Standard 2 — col 1, row 2 */}
                  <DestinationCard
                    dest={destinations[3]}
                    variant="standard"
                  />
                  {/* Standard 3 — cols 2-3, row 2 */}
                  <DestinationCard
                    dest={destinations[4]}
                    variant="standard"
                    style={{ gridColumn: "span 2" }}
                  />
                </BentoGrid>
              ) : (
                <BentoGrid columns="repeat(2, 1fr)" gap={10}>
                  {destinations.map((dest, i) => (
                    <DestinationCard
                      key={dest.slug}
                      dest={dest}
                      variant={i === 0 ? "featured" : "standard"}
                      style={{
                        minHeight: i === 0 ? "280px" : "220px",
                        ...(i === 0 ? { gridColumn: "span 2" } : {}),
                      }}
                    />
                  ))}
                </BentoGrid>
              )}
            </div>

            {/* Tablet 2-column grid */}
            <div className="hidden md:block lg:hidden">
              <BentoGrid columns="repeat(2, 1fr)" gap={10}>
                {destinations.map((dest, i) => (
                  <DestinationCard
                    key={dest.slug}
                    dest={dest}
                    variant={i === 0 ? "featured" : "standard"}
                    style={{
                      minHeight: i === 0 ? "280px" : "220px",
                      ...(i === 0 ? { gridColumn: "span 2" } : {}),
                    }}
                  />
                ))}
              </BentoGrid>
            </div>

            {/* Mobile single-column stack */}
            <div className="grid grid-cols-1 gap-[10px] md:hidden">
              {destinations.map((dest, i) => (
                <DestinationCard
                  key={dest.slug}
                  dest={dest}
                  variant={i === 0 ? "featured" : "standard"}
                  style={{ minHeight: i === 0 ? "280px" : "200px" }}
                />
              ))}
            </div>
          </>
        )}
      </Reveal>
    </section>
  );
}
