import Image from "next/image";
import { Star } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/bento";
import { Reveal, RevealStagger } from "@/components/motion";

/* ------------------------------------------------------------------ */
/*  Inline testimonial data                                            */
/* ------------------------------------------------------------------ */

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t1",
    name: "Sophia Laurent",
    role: "Frequent Traveler, Paris",
    avatar: "/media/home-hero-poster.jpg",
    rating: 5,
    quote:
      "An extraordinary experience from start to finish. Every detail was curated to perfection — the private transfers, the sunset yacht dinner, the handpicked villas. Truly a diamond journey.",
  },
  {
    id: "t2",
    name: "James Whitfield",
    role: "Entrepreneur, London",
    avatar: "/media/home-hero-poster.jpg",
    rating: 5,
    quote:
      "The concierge team anticipated our every need before we even asked. From securing a private temple visit in Kyoto to arranging a bespoke wellness program in Bali — impeccable.",
  },
  {
    id: "t3",
    name: "Amara Okafor",
    role: "Art Director, Lagos",
    avatar: "/media/home-hero-poster.jpg",
    rating: 5,
    quote:
      "Sand Diamonds turned a simple anniversary trip into the most memorable week of our lives. The attention to craft and culture made every moment feel intentional.",
  },
];

/* ------------------------------------------------------------------ */
/*  Star rating row                                                    */
/* ------------------------------------------------------------------ */

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < count
              ? "fill-luxgold text-luxgold"
              : "fill-transparent text-luxtext-subtle"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonial card                                                   */
/* ------------------------------------------------------------------ */

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <BentoCard variant="default" hoverable className="relative flex flex-col p-[18px]">
      {/* Decorative oversized quote mark */}
      <span
        className="pointer-events-none absolute left-4 top-3 select-none font-display text-[80px] leading-none text-luxgold/10"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      {/* Star rating */}
      <div className="relative z-10 mb-4">
        <StarRating count={testimonial.rating} />
      </div>

      {/* Quote text — editorial serif tone */}
      <blockquote className="relative z-10 flex-1">
        <p className="font-display text-[18px] leading-[1.5] text-luxtext md:text-[22px] md:leading-[1.45]">
          {testimonial.quote}
        </p>
      </blockquote>

      {/* Footer: avatar + name + role */}
      <footer className="relative z-10 mt-5 flex items-center gap-3 border-t border-luxborder pt-4">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={40}
          height={40}
          className="h-[40px] w-[40px] shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <h4 className="truncate font-sans text-[14px] font-semibold text-luxtext">
            {testimonial.name}
          </h4>
          <p className="truncate font-sans text-[12px] text-luxtext-muted">
            {testimonial.role}
          </p>
        </div>
      </footer>
    </BentoCard>
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
      <h3 className="font-serif text-[20px] text-luxtext">
        Guest stories coming soon
      </h3>
      <p className="mt-2 max-w-[42ch] font-sans text-[13px] leading-[1.55] text-luxtext-muted">
        We are gathering testimonials from our most recent diamond journeys.
        Check back shortly for curated guest experiences.
      </p>
    </BentoCard>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryTestimonials section (server component)                      */
/* ------------------------------------------------------------------ */

export function LuxuryTestimonials() {
  const testimonials = TESTIMONIALS;

  return (
    <section aria-labelledby="luxury-testimonials-heading" className="mt-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-6">
          <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-luxgold">
            Guest Experiences
          </p>
          <h2 id="luxury-testimonials-heading" className="mt-1 font-serif text-[22px] text-luxtext">
            What Our{" "}
            <em className="italic text-luxgold-light">Travelers</em> Say
          </h2>
        </div>
      </Reveal>

      {/* ── Cards ──────────────────────────────────────────────────── */}
      {testimonials.length === 0 ? (
        <Reveal>
          <BentoGrid columns="1fr">
            <EmptyState />
          </BentoGrid>
        </Reveal>
      ) : (
        <BentoGrid columns="repeat(3, 1fr)" className="max-md:grid-cols-1">
          <RevealStagger staggerMs={80}>
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </RevealStagger>
        </BentoGrid>
      )}
    </section>
  );
}
