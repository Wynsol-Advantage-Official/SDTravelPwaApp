"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Tour } from "@/types/tour";
import { formatPrice } from "@/lib/utils/format";

// ---------------------------------------------------------------------------
// TourCard — Luxury card with hero image, price badge, and hover scale
// ---------------------------------------------------------------------------
// Client Component because of Framer Motion hover interactions.
// Keep markup minimal — the heavy image is SSR'd, only the motion wrapper is client.
// ---------------------------------------------------------------------------

interface TourCardProps {
  tour: Tour;
  /** Priority loading for above-the-fold cards (first 2-3) */
  priority?: boolean;
}

export function TourCard({ tour, priority = false }: TourCardProps) {
  return (
    <Link href={`/tours/${tour.slug}`} className="group block">
      <motion.article
        className="relative overflow-hidden rounded-sm bg-white shadow-md dark:bg-ocean-card"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        {/* ── Hero Image ─────────────────────────────────────────────────── */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={tour.heroImage.src}
            alt={tour.heroImage.alt || tour.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />

          {/* Gradient scrim for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/60 via-transparent to-transparent" />

          {/* Duration badge */}
          <span className="absolute left-4 top-4 rounded-sm bg-ocean-deep/70 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
            {tour.duration} Days
          </span>

          {/* Price badge */}
          <span className="absolute bottom-4 right-4 rounded-sm bg-ocean px-4 py-1.5 text-sm font-bold text-ocean-deep">
            From {formatPrice(tour.startingPrice, tour.currency)}
          </span>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="p-5">
          {/* Destination tag */}
          {tour.destination?.name && (
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-chill-300">
              {tour.destination.name}
            </p>
          )}

          <h3 className="font-sans text-xl font-semibold text-ocean-deep transition-colors duration-300 group-hover:text-blue-chill dark:text-white dark:group-hover:text-blue-chill-300">
            {tour.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ocean-deep/60 dark:text-white/60">
            {tour.summary}
          </p>

          {/* Highlights preview */}
          {tour.highlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tour.highlights.slice(0, 3).map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-sm bg-tan-100 px-2 py-0.5 text-xs text-ocean-deep/60 dark:bg-ocean-deep dark:text-white/60"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
