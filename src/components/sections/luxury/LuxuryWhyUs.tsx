import { Reveal } from "@/components/motion";
import { PillarCardGrid } from "./PillarCardGrid";
import type { Pillar } from "./PillarCardGrid";

// ---------------------------------------------------------------------------
// LuxuryWhyUs -- Static Server Component
// ---------------------------------------------------------------------------
// Brand value proposition section. Pillar data is defined here; the
// PillarCardGrid client component handles responsive pagination.
// ---------------------------------------------------------------------------

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
/*  LuxuryWhyUs section (static server component)                     */
/* ------------------------------------------------------------------ */

export function LuxuryWhyUs() {
    return (
        <section aria-labelledby="luxury-why-us-heading" className="mt-6">
            {/* -- Full-width band header ------------------------------------ */}
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

            {/* -- Responsive paginated pillar grid ------------------------- */}
            <div className="mt-8">
                <PillarCardGrid pillars={PILLARS} />
            </div>
        </section>
    );
}
