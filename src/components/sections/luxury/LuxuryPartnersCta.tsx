import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/bento";
import { Reveal, Card3DReveal } from "@/components/motion";

/* ------------------------------------------------------------------ */
/*  Inline partner data                                                */
/* ------------------------------------------------------------------ */

interface PartnerItem {
  id: string;
  name: string;
}

const PARTNERS: PartnerItem[] = [
  { id: "p1", name: "Aman Resorts" },
  { id: "p2", name: "Four Seasons" },
  { id: "p3", name: "Belmond" },
  { id: "p4", name: "One&Only" },
  { id: "p5", name: "Six Senses" },
  { id: "p6", name: "Rosewood" },
];

/* ------------------------------------------------------------------ */
/*  Partner pill                                                       */
/* ------------------------------------------------------------------ */

function PartnerPill({ partner }: { partner: PartnerItem }) {
  return (
    <div
      className={[
        "flex items-center justify-center",
        "rounded-[12px] border border-khaki/40 bg-tan-100 px-4 py-3",
        "font-sans text-[13px] font-medium text-ocean-deep/60",
        "transition-[border-color,color,background-color] duration-[220ms] ease-out",
        "hover:border-ocean/30 hover:text-ocean-deep dark:border-white/10 dark:bg-ocean-deep dark:text-white/60 dark:hover:border-blue-chill/30 dark:hover:text-white",
      ].join(" ")}
    >
      {partner.name}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryPartnersCta section (server component)                       */
/* ------------------------------------------------------------------ */

export function LuxuryPartnersCta() {
  const partners = PARTNERS;

  return (
    <section aria-labelledby="luxury-partners-cta-heading" className="mt-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-6">
          <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-ocean dark:text-blue-chill">
            Trusted Partners
          </p>
          <h2 id="luxury-partners-cta-heading" className="mt-1 font-sans text-[22px] text-ocean-deep transition-colors duration-300 dark:text-white">
            World-Class{" "}
            <em className="italic text-ocean dark:text-blue-chill-300">Collaborations</em>
          </h2>
        </div>
      </Reveal>

      {/* ── 2-column layout ────────────────────────────────────────── */}
      <BentoGrid columns="1fr 1fr" className="max-md:grid-cols-1">
        {/* Left column — Partners pill grid */}
        <BentoCard variant="default" hoverable className="p-[18px]">
          <h3 className="mb-4 font-sans text-[18px] text-ocean-deep dark:text-white">
            Our Partners
          </h3>
          <div className="grid grid-cols-3 gap-[10px] max-sm:grid-cols-2">
            {partners.map((p, i) => (
              <Card3DReveal
                key={p.id}
                index={i}
                rotateXFrom={8}
                depthFrom={-20}
                distance={15}
                durationMs={400}
              >
                <PartnerPill partner={p} />
              </Card3DReveal>
            ))}
          </div>
        </BentoCard>

        {/* Right column — CTA card */}
        <Card3DReveal
          index={PARTNERS.length}
          rotateXFrom={0}
          depthFrom={0}
          distance={40}
          durationMs={600}
          delayMs={200}
        >
          <BentoCard
            variant="default"
            className="relative flex flex-col justify-between overflow-hidden p-[20px]"
          >
            {/* Gradient background wash */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-tan-100 via-ocean/[0.04] to-tan-200 dark:from-ocean-card dark:via-blue-chill/[0.08] dark:to-ocean-deep"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-1 flex-col justify-center">
              <h3 className="font-sans text-[28px] leading-tight text-ocean-deep dark:text-white">
                Begin Your{" "}
                <em className="italic text-ocean dark:text-blue-chill-300">Diamond</em> Journey
              </h3>
              <p className="mt-3 max-w-[38ch] font-sans text-[14px] leading-[1.55] text-ocean-deep/60 dark:text-white/60">
                Our concierge team crafts bespoke itineraries tailored to your
                every desire. Start planning your next extraordinary escape
                today.
              </p>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 rounded-[8px] bg-ocean px-5 py-2.5 text-[12px] font-semibold uppercase text-white transition-[transform,background-color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:bg-blue-chill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-tan-50 dark:focus-visible:ring-offset-ocean-deep"
                >
                  Explore Diamonds
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-[8px] border border-khaki/40 px-5 py-2.5 text-[12px] font-semibold uppercase text-ocean-deep transition-[transform,border-color,color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:border-ocean/30 hover:text-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill focus-visible:ring-offset-2 focus-visible:ring-offset-tan-50 dark:border-white/10 dark:text-white dark:hover:border-blue-chill/30 dark:hover:text-blue-chill-300 dark:focus-visible:ring-offset-ocean-deep"
                >
                  Contact Concierge
                </Link>
              </div>

              {/* Trust line */}
              <p className="mt-4 font-sans text-[11px] text-ocean-deep/40 dark:text-white/40">
                Complimentary consultation · 48-hour itinerary turnaround
              </p>
            </div>
          </BentoCard>
        </Card3DReveal>
      </BentoGrid>
    </section>
  );
}
