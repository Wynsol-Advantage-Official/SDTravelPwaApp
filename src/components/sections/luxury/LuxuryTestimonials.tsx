import Image from "next/image";
import { BentoGrid, BentoCard } from "@/components/bento";
import { Reveal, Card3DReveal } from "@/components/motion";
import { getTestimonials } from "@/lib/services";
import type { WixTestimonial } from "@/lib/services";

/* ------------------------------------------------------------------ */
/*  Testimonial card                                                   */
/* ------------------------------------------------------------------ */

function TestimonialCard({ testimonial }: { testimonial: WixTestimonial }) {
  return (
    <BentoCard variant="default" hoverable className="relative flex flex-col p-4.5">
      {/* Decorative oversized quote mark */}
      <span
        className="pointer-events-none absolute left-4 top-3 select-none font-display text-[80px] leading-none text-ocean/10 dark:text-blue-chill/10"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      {/* Quote text — editorial serif tone */}
      <blockquote className="relative z-10 flex-1">
        <p className="font-display text-[11px] leading-normal text-ocean-deep dark:text-white md:text-[14px] md:leading-[1.45]">
          {testimonial.quote}
        </p>
      </blockquote>

      {/* Footer: avatar + name + role */}
      <footer className="relative z-10 mt-5 flex items-center gap-3 border-t border-khaki/30 pt-4 dark:border-white/10">
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            unoptimized={testimonial.avatar.startsWith("data:")}
          />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-full bg-ocean/10" />
        )}
        <div className="min-w-0">
          <h4 className="truncate font-sans text-[14px] font-semibold text-ocean-deep dark:text-white">
            {testimonial.name}
          </h4>
          {testimonial.date && (
            <p className="truncate font-sans text-[12px] text-ocean-deep/55 dark:text-white/60">
              {testimonial.date}
            </p>
          )}
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
      <h3 className="font-sans text-[20px] text-ocean-deep dark:text-white">
        Guest stories coming soon
      </h3>
      <p className="mt-2 max-w-[42ch] font-sans text-[13px] leading-[1.55] text-ocean-deep/60 dark:text-white/60">
        We are gathering testimonials from our most recent diamond journeys.
        Check back shortly for curated guest experiences.
      </p>
    </BentoCard>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryTestimonials section (async server component)               */
/* ------------------------------------------------------------------ */

export async function LuxuryTestimonials() {
  const testimonials = await getTestimonials(6, { featuredOnly: true });

  return (
    <section aria-labelledby="luxury-testimonials-heading" className="mt-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-6">
          <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-ocean dark:text-blue-chill">
            Guest Experiences
          </p>
          <h2 id="luxury-testimonials-heading" className="mt-1 font-sans text-[22px] text-ocean-deep transition-colors duration-300 dark:text-white">
            What Our{" "}
            <em className="italic text-ocean dark:text-blue-chill-300">Travelers</em> Say
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
        <BentoGrid columns="repeat(auto-fit, minmax(300px, 1fr))" className="max-md:grid-cols-1">
          {testimonials.map((t, i) => (
            <Card3DReveal
              key={t._id}
              index={i}
              rotateXFrom={8}
              rotateYFrom={-6}
              depthFrom={-24}
              distance={45}
              durationMs={550}
            >
              <TestimonialCard testimonial={t} />
            </Card3DReveal>
          ))}
        </BentoGrid>
      )}
    </section>
  );
}
