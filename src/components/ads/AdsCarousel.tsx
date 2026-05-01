"use client";

// ---------------------------------------------------------------------------
// AdsCarousel — paginated ad card grid (max 4 per view)
// ---------------------------------------------------------------------------
// Client component. Receives pre-fetched ads from the LuxuryAds Server
// Component. Shows up to ITEMS_PER_PAGE cards at a time with prev/next
// navigation and animated page transitions.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdTourCard } from "./AdTourCard";
import type { Ad } from "@/types/ad";

interface AdsCarouselProps {
  ads: Ad[];
}

const ITEMS_PER_PAGE = 4;

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
};

export function AdsCarousel({ ads }: AdsCarouselProps) {
  const totalPages = Math.ceil(ads.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const slice = ads.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  function goTo(next: number) {
    setDir(next > page ? 1 : -1);
    setPage(next);
  }

  return (
    <div>
      {/* ── Card grid with animated page transitions ───────────────── */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            // Responsive columns: 1 → 2 → 3 → 4
            className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {slice.map((ad) => (
              <AdTourCard key={ad._id} ad={ad} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Pagination controls (only when multiple pages) ─────────── */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          {/* Prev */}
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-ocean shadow-sm transition-[background-color,opacity] duration-150 hover:bg-ocean hover:text-white disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:bg-ocean-card dark:text-blue-chill dark:hover:bg-ocean"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2" role="group" aria-label="Ad pages">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === page ? "page" : undefined}
                className={[
                  "h-2 rounded-full transition-[width,background-color] duration-220",
                  i === page
                    ? "w-6 bg-ocean dark:bg-blue-chill"
                    : "w-2 bg-stone-300 dark:bg-white/20",
                ].join(" ")}
              />
            ))}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages - 1}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-ocean shadow-sm transition-[background-color,opacity] duration-150 hover:bg-ocean hover:text-white disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:bg-ocean-card dark:text-blue-chill dark:hover:bg-ocean"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
