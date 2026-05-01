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
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        aria-label={`${count} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 12 12"
            className={`h-3.5 w-3.5 ${
              i < count
                ? "fill-amber-400"
                : "fill-ocean/15 dark:fill-white/15"
            }`}
            aria-hidden="true"
          >
            <path d="M6 0l1.35 4.15H11L7.4 6.7l1.35 4.15L6 8.4l-2.75 2.45L4.6 6.7 1 4.15h3.65z" />
          </svg>
        ))}
      </div>
      <span className="font-sans text-[10px] font-semibold text-ocean/60 dark:text-white/40">
        {count}.0
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonial card                                                   */
/* ------------------------------------------------------------------ */

function TestimonialCard({ testimonial }: { testimonial: WixTestimonial }) {
  return (
    <div className="group relative overflow-hidden rounded-[14px] border border-khaki/30 bg-white pl-5 pr-5 pt-5 pb-5 transition-[transform,box-shadow] duration-220 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] dark:border-white/10 dark:bg-ocean-card">
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-[14px] bg-linear-to-b from-ocean via-blue-chill to-ocean/30"
        aria-hidden="true"
      />

      {/* Decorative background quote */}
      <span
        className="pointer-events-none absolute right-4 top-1 select-none font-sans text-[72px] font-black leading-none text-ocean/5 dark:text-white/5"
        aria-hidden="true"
      >
        &rdquo;
      </span>

      <StarRating />

      <blockquote className="relative mt-3">
        <p className="font-sans text-[13px] italic leading-relaxed text-ocean-deep dark:text-white/85">
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
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-ocean/10 dark:ring-white/10"
              unoptimized={testimonial.avatar.startsWith("data:")}
            />
          ) : (
            <div className="h-9 w-9 shrink-0 rounded-full bg-linear-to-br from-ocean/20 to-blue-chill/20 ring-2 ring-ocean/10 dark:ring-white/10" />
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

        {/* Arrow button — fills on hover */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ocean/20 bg-ocean/5 text-ocean transition-[background-color,color] duration-220 group-hover:bg-ocean group-hover:text-white dark:border-white/15 dark:bg-white/5 dark:text-white/50 dark:group-hover:bg-blue-chill dark:group-hover:text-ocean-deep"
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
            <div className="relative overflow-hidden rounded-[14px] border border-khaki/30 bg-white p-7 dark:border-white/10 dark:bg-ocean-card">
              {/* Decorative radial glow */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ocean/5 blur-2xl dark:bg-blue-chill/8"
                aria-hidden="true"
              />
              {/* Top accent line */}
              <div
                className="absolute left-0 right-0 top-0 h-0.5 rounded-t-[14px] bg-linear-to-r from-ocean via-blue-chill to-transparent"
                aria-hidden="true"
              />

              <p className="relative flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-widest text-ocean dark:text-blue-chill">
                <span aria-hidden="true" className="text-[10px]">◆</span>
                Guest Experiences
              </p>
              <h2
                id="luxury-testimonials-heading"
                className="relative mt-3 font-sans text-[26px] font-bold leading-tight text-ocean-deep dark:text-white sm:text-[30px]"
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
              <p className="relative mt-3 font-sans text-[13px] leading-relaxed text-ocean-deep/55 dark:text-white/50">
                Join over 2,400 travelers who've trusted Sand Diamonds with their
                dream Caribbean escape.
              </p>
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
                className="object-cover brightness-90"
              />

              {/* Layered scrims: strong bottom, lighter top vignette */}
              <div
                className="absolute inset-0 bg-linear-to-t from-ocean-deep/90 via-ocean-deep/30 to-transparent"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-linear-to-b from-ocean-deep/30 via-transparent to-transparent"
                aria-hidden="true"
              />

              {/* Floating badge — top left */}
              <div className="absolute left-4 top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-sans text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                  <span aria-hidden="true" className="text-amber-400">◆</span>
                  Diamond Class
                </span>
              </div>

              {/* Stats row — bottom */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
                <div>
                  <p className="font-sans text-[52px] font-extrabold leading-none text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
                    2.4K+
                  </p>
                  <p className="mt-0.5 font-sans text-[9px] uppercase tracking-widest text-white/65">
                    Happy Travelers
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[28px] font-extrabold leading-none text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
                    98%
                  </p>
                  <p className="mt-0.5 font-sans text-[9px] uppercase tracking-widest text-white/65">
                    5-Star Reviews
                  </p>
                </div>
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
        <div className="relative mt-5 overflow-hidden rounded-[14px] bg-ocean-deep px-7 py-6 dark:bg-ocean-card">
          {/* Decorative diamond glyphs */}
          <span
            className="pointer-events-none absolute right-24 top-1/2 -translate-y-1/2 select-none font-sans text-[80px] font-black leading-none text-white/5"
            aria-hidden="true"
          >
            ◆
          </span>
          <span
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 select-none font-sans text-[40px] font-black leading-none text-white/5"
            aria-hidden="true"
          >
            ◆
          </span>
          {/* Top accent line */}
          <div
            className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-blue-chill/60 via-blue-chill/20 to-transparent"
            aria-hidden="true"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-sans text-[9px] uppercase tracking-widest text-blue-chill/70">
                ◆ Sand Diamonds Travel
              </p>
              <p className="mt-1 font-sans text-[20px] font-bold text-white sm:text-[22px]">
                Be Our Next{" "}
                <em className="italic text-blue-chill-300">Diamond</em> Traveler
              </p>
            </div>
            <Link
              href="/tours"
              className="shrink-0 rounded-[10px] bg-white px-5 py-2.5 font-sans text-[11px] font-bold uppercase tracking-widest text-ocean-deep transition-[background-color,transform] duration-220 ease-out hover:-translate-y-0.5 hover:bg-blue-chill-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explore Tours
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
