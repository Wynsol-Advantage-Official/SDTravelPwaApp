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
        image: "/media/1.jpg",
        imageAlt: "Discover Ochi card featuring Dunn’s River and Green Grotto",
        title: "Discover Ochi",
        body: "Embark on a bespoke journey through Ocho Rios, featuring Dunn’s River, Green Grotto, and Dolphin Cove. Every itinerary is crafted from scratch and hand-selected by your concierge to match exactly how you travel.",
        href: "/tours",
    },
    {
        id: "inclusive",
        image: "/media/2.jpg",
        imageAlt: "Discover Negril card featuring 7 Mile Beach and Rick's Cafe",
        title: "Discover Negril",
        body: "Experience all-inclusive luxury from 7 Mile Beach to Rick’s Cafe. From private transfers and curated dining to horseback riding adventures, every detail is handled with 24/7 concierge support.",
        href: "/tours",
    },
    {
        id: "experts",
        image: "/media/3.jpg",
        imageAlt: "Carefree Travel Bundle card featuring local bamboo rafting",
        title: "Carefree Travel Bundle",
        body: "Experience the island like a local through our vetted expert partners. We connect you with historians, chefs, and cultural ambassadors to ensure your travel bundle offers an authentic Jamaican perspective.",
        href: "/destinations",
    },
];

/* ------------------------------------------------------------------ */
/*  Pillar card                                                         */
/* ------------------------------------------------------------------ */

function PillarCard({ pillar }: { pillar: Pillar }) {
    return (
        <div className="flex flex-col h-120 gap-4 rounded-[14px] border border-white/10 bg-white/4 p-4 transition-[border-color,box-shadow] duration-220 ease-out hover:border-ocean/30 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-ocean-card">
            {/* Image */}
            <div className="relative w-full h-full bg-red-500 px-10 scale-100 overflow-hidden rounded-[14px]">
                <Image
                    src={pillar.image}
                    alt={pillar.imageAlt}
                    fill
                    className="aspect-3/2 object-fit  transition-transform duration-500 group-hover:scale-105"
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
