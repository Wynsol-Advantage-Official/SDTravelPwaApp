import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { getTestimonials } from "@/lib/services";
import type { WixTestimonial } from "@/lib/services";

/* ------------------------------------------------------------------ */
/*  Star rating                                                        */
/* ------------------------------------------------------------------ */

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`h-3 w-3 ${
            i < count
              ? "fill-ocean dark:fill-blue-chill"
              : "fill-ocean/20 dark:fill-white/20"
          }`}
          aria-hidden="true"
        >
          <path d="M6 0l1.35 4.15H11L7.4 6.7l1.35 4.15L6 8.4l-2.75 2.45L4.6 6.7 1 4.15h3.65z" />
        </svg>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonial card                                                   */
/* ------------------------------------------------------------------ */

function TestimonialCard({ testimonial }: { testimonial: WixTestimonial }) {
  return (
    <div className="relative rounded-[14px] border border-khaki/30 bg-white p-5 dark:border-white/10 dark:bg-ocean-card">
      <StarRating />

      <blockquote className="mt-3">
        <p className="font-sans text-[13px] leading-relaxed text-ocean-deep dark:text-white/85">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      <footer className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
              unoptimized={testimonial.avatar.startsWith("data:")}
            />
          ) : (
            <div className="h-9 w-9 shrink-0 rounded-full bg-ocean/10 dark:bg-ocean/20" />
          )}
          <div className="min-w-0">
            <p className="truncate font-sans text-[13px] font-semibold text-ocean-deep dark:text-white">
              {testimonial.name}
            </p>
            {testimonial.date && (
              <p className="truncate font-sans text-[11px] text-ocean-deep/50 dark:text-white/50">
                {testimonial.date}
              </p>
            )}
          </div>
        </div>

        {/* Decorative arrow */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-khaki/40 text-ocean-deep/40 dark:border-white/15 dark:text-white/40"
          aria-hidden="true"
        >
          <ArrowUpRight size={13} />
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryTestimonials section (async server component)               */
/* ------------------------------------------------------------------ */

export async function LuxuryTestimonials() {
  const testimonials = await getTestimonials(6, { featuredOnly: true });
  const displayed = testimonials.slice(0, 3);

  return (
    <section aria-labelledby="luxury-testimonials-heading" className="mt-6">
      {/* ── Main 2-col grid ─────────────────────────────────────────── */}
      {/*
          Desktop: left = heading card + hero image (fills remaining height)
                   right = 3 stacked testimonial cards
          Mobile:  heading → testimonial cards → image
      */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">

        {/* ── Left: heading card + hero image ────────────────────────── */}
        <div className="flex flex-col gap-5">
          <Reveal>
            <div className="rounded-[14px] border border-khaki/30 bg-white p-7 dark:border-white/10 dark:bg-ocean-card">
              <p className="font-sans text-[9px] uppercase tracking-widest text-ocean dark:text-blue-chill">
                Guest Experiences
              </p>
              <h2
                id="luxury-testimonials-heading"
                className="mt-3 font-sans text-[26px] font-bold leading-tight text-ocean-deep dark:text-white sm:text-[30px]"
              >
                Hear From Our{" "}
                <em className="italic text-ocean dark:text-blue-chill-300">
                  Satisfied
                </em>{" "}
                Travelers{" "}
                <span aria-hidden="true" className="not-italic text-red-400">
                  ♥
                </span>
              </h2>
            </div>
          </Reveal>

          {/* Hero image — fills remaining height to match right column */}
          <Reveal>
            <div className="relative min-h-60 flex-1 overflow-hidden rounded-[14px] lg:min-h-0">
              <Image
                src="/og/default.jpg"
                alt="Luxury Caribbean travel destination"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Gradient scrim */}
              <div
                className="absolute inset-0 bg-linear-to-t from-ocean-deep/75 via-ocean-deep/15 to-transparent"
                aria-hidden="true"
              />
              {/* Stat overlay */}
              <div className="absolute bottom-5 right-5 text-right">
                <p className="font-sans text-[52px] font-extrabold leading-none text-white drop-shadow-md">
                  2.4K+
                </p>
                <p className="font-sans text-[9px] uppercase tracking-widest text-white/65">
                  Happy Travelers
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Right: 3 testimonial cards ───────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {displayed.length === 0 ? (
            <div className="rounded-[14px] border border-khaki/30 bg-white p-8 text-center dark:border-white/10 dark:bg-ocean-card">
              <p className="font-sans text-[14px] text-ocean-deep/70 dark:text-white/60">
                Guest stories coming soon.
              </p>
            </div>
          ) : (
            displayed.map((t, i) => (
              <Reveal key={t._id} delayMs={i * 80}>
                <TestimonialCard testimonial={t} />
              </Reveal>
            ))
          )}
        </div>

      </div>

      {/* ── Bottom CTA band ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-ocean-deep px-7 py-5 dark:bg-ocean-card">
          <p className="font-sans text-[20px] font-bold text-white sm:text-[22px]">
            Be Our Next{" "}
            <em className="italic text-blue-chill-300">Diamond</em> Traveler
          </p>
          <Link
            href="/tours"
            className="shrink-0 rounded-[10px] bg-white px-5 py-2.5 font-sans text-[11px] font-bold uppercase tracking-widest text-ocean-deep transition-[background-color,transform] duration-220 ease-out hover:-translate-y-0.5 hover:bg-blue-chill-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Explore Tours
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
