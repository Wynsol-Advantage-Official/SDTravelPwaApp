import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/bento";
import { Reveal, RevealStagger } from "@/components/motion";

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
        "rounded-[12px] border border-luxborder bg-luxury-card3 px-4 py-3",
        "font-sans text-[13px] font-medium text-luxtext-muted",
        "transition-[border-color,color] duration-[220ms] ease-out",
        "hover:border-luxborder-gold hover:text-luxtext",
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
          <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-luxgold">
            Trusted Partners
          </p>
          <h2 id="luxury-partners-cta-heading" className="mt-1 font-serif text-[22px] text-luxtext">
            World-Class{" "}
            <em className="italic text-luxgold-light">Collaborations</em>
          </h2>
        </div>
      </Reveal>

      {/* ── 2-column layout ────────────────────────────────────────── */}
      <BentoGrid columns="1fr 1fr" className="max-md:grid-cols-1">
        <RevealStagger staggerMs={100}>
          {/* Left column — Partners pill grid */}
          <BentoCard variant="default" hoverable className="p-[18px]">
            <h3 className="mb-4 font-serif text-[18px] text-luxtext">
              Our Partners
            </h3>
            <div className="grid grid-cols-3 gap-[10px] max-sm:grid-cols-2">
              {partners.map((p) => (
                <PartnerPill key={p.id} partner={p} />
              ))}
            </div>
          </BentoCard>

          {/* Right column — CTA card */}
          <BentoCard
            variant="default"
            className="relative flex flex-col justify-between overflow-hidden p-[20px]"
          >
            {/* Gradient background wash */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-luxury-card via-luxgold/[0.08] to-luxury-base"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-1 flex-col justify-center">
              <h3 className="font-serif text-[28px] leading-tight text-luxtext">
                Begin Your{" "}
                <em className="italic text-luxgold-light">Diamond</em> Journey
              </h3>
              <p className="mt-3 max-w-[38ch] font-sans text-[14px] leading-[1.55] text-luxtext-muted">
                Our concierge team crafts bespoke itineraries tailored to your
                every desire. Start planning your next extraordinary escape
                today.
              </p>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 rounded-[8px] bg-luxgold px-5 py-2.5 text-[12px] font-semibold uppercase text-luxury-base transition-[transform,background-color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:bg-luxgold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxgold focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-base"
                >
                  Explore Diamonds
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-[8px] border border-luxborder px-5 py-2.5 text-[12px] font-semibold uppercase text-luxtext transition-[transform,border-color,color] duration-[220ms] ease-out hover:-translate-y-[1px] hover:border-luxborder-gold hover:text-luxgold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxgold focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-base"
                >
                  Contact Concierge
                </Link>
              </div>

              {/* Trust line */}
              <p className="mt-4 font-sans text-[11px] text-luxtext-subtle">
                Complimentary consultation · 48-hour itinerary turnaround
              </p>
            </div>
          </BentoCard>
        </RevealStagger>
      </BentoGrid>
    </section>
  );
}
