import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";

// ---------------------------------------------------------------------------
// LuxuryWhyUs — Static Server Component
// ---------------------------------------------------------------------------
// Brand value proposition section. Three pillars: Bespoke Itineraries,
// All-Inclusive Luxury, Local Expert Partners. No data fetching — content
// is brand copy that changes infrequently and is managed here directly.
// ---------------------------------------------------------------------------

interface Pillar {
  id: string;
  image: string;
  imageAlt: string;
  title: string;
  body: string;
  href: string;
}

const PILLARS: Pillar[] = [
  {
    id: "bespoke",
    image: "/og/default.jpg",
    imageAlt: "A luxury travel concierge reviewing a bespoke itinerary map",
    title: "Bespoke Itineraries",
    body: "Every journey is crafted from scratch — never templated. Your concierge hand-selects properties, experiences, and transfers to match exactly how you travel, so no two itineraries are alike.",
    href: "/tours",
  },
  {
    id: "inclusive",
    image: "/og/default.jpg",
    imageAlt: "White-gloved sommelier presenting champagne on a private terrace",
    title: "All-Inclusive Luxury",
    body: "From the moment you depart to the second you return, every detail is handled. Private transfers, curated dining, spa access, and 24/7 concierge support are woven into every package.",
    href: "/tours",
  },
  {
    id: "experts",
    image: "/og/default.jpg",
    imageAlt: "Local expert guide leading guests through a Caribbean rainforest",
    title: "Local Expert Partners",
    body: "We partner exclusively with vetted on-the-ground experts — historians, naturalists, chefs, and cultural ambassadors — so you experience every destination the way locals do.",
    href: "/destinations",
  },
];

/* ------------------------------------------------------------------ */
/*  Pillar card                                                         */
/* ------------------------------------------------------------------ */

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div className="flex flex-col">
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden rounded-[14px]">
        <Image
          src={pillar.image}
          alt={pillar.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          className="object-cover"
        />
      </div>

      {/* Text content */}
      <div className="mt-5 flex flex-col items-center text-center">
        <h3 className="font-sans text-[11px] font-bold uppercase tracking-widest text-ocean-deep dark:text-white">
          {pillar.title}
        </h3>

        <p className="mt-3 font-sans text-[13px] leading-relaxed text-ocean-deep/65 dark:text-white/60">
          {pillar.body}
        </p>

        <Link
          href={pillar.href}
          className="mt-4 inline-flex items-center gap-1 font-sans text-[12px] font-semibold text-ocean transition-colors hover:text-ocean-deep dark:text-blue-chill dark:hover:text-blue-chill-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
        >
          Learn More
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryWhyUs section (static server component)                     */
/* ------------------------------------------------------------------ */

export function LuxuryWhyUs() {
  return (
    <section aria-labelledby="luxury-why-us-heading" className="mt-6">
      {/* ── Full-width band header ──────────────────────────────────── */}
      <Reveal>
        <div className="rounded-[14px] bg-ocean-deep px-6 py-10 text-center dark:bg-ocean-card">
          <p className="font-sans text-[9px] uppercase tracking-widest text-blue-chill/80">
            Why Sand Diamonds
          </p>
          <h2
            id="luxury-why-us-heading"
            className="mt-2 font-sans text-[28px] font-bold leading-tight text-white sm:text-[32px]"
          >
            You Deserve{" "}
            <em className="italic text-blue-chill-300">the Best</em>
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] font-sans text-[13px] leading-relaxed text-white/60">
            Every detail of your journey — from the first enquiry to the final
            farewell — is handled with the precision and warmth of a true
            diamond-class concierge.
          </p>
        </div>
      </Reveal>

      {/* ── 3-column pillar grid ────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.id} delayMs={i * 80}>
            <PillarCard pillar={pillar} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
