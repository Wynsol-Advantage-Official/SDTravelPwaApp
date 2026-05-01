"use client";

// ---------------------------------------------------------------------------
// AdsCarousel — paginated ad card grid (max 4 per view, never wraps)
// ---------------------------------------------------------------------------
// Client component. Receives pre-fetched ads from the LuxuryAds Server
// Component. Items-per-page matches the number of visible columns so cards
// always fill exactly one row — pagination fires instead of wrapping.
//
// Breakpoints mirror Tailwind defaults:
//   < 640px  → 1 col   (mobile)
//   640–1023 → 2 cols  (sm)
//   1024–1279→ 3 cols  (lg)
//   ≥ 1280   → 4 cols  (xl)
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdTourCard } from "./AdTourCard";
import type { Ad } from "@/types/ad";

interface AdsCarouselProps {
  ads: Ad[];
}

/** Map column count → Tailwind grid-cols-N class (static strings for purge safety) */
const COLS_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** Breakpoints in descending order → [minWidth, columns] */
const BREAKPOINTS: [number, number][] = [
  [1280, 4],
  [1024, 3],
  [640, 2],
];

function getColumns(): number {
  if (typeof window === "undefined") return 1;
  for (const [minW, cols] of BREAKPOINTS) {
    if (window.matchMedia(`(min-width: ${minW}px)`).matches) return cols;
  }
  return 1;
}

/** Returns the number of grid columns for the current viewport. Updates on resize. */
function useGridColumns(): number {
  const [cols, setCols] = useState<number>(getColumns);

  useEffect(() => {
    const mqs = BREAKPOINTS.map(([minW, c]) => ({
      mq: window.matchMedia(`(min-width: ${minW}px)`),
      cols: c,
    }));
    function update() { setCols(getColumns()); }
    mqs.forEach(({ mq }) => mq.addEventListener("change", update));
    return () => mqs.forEach(({ mq }) => mq.removeEventListener("change", update));
  }, []);

  return cols;
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
};

export function AdsCarousel({ ads }: AdsCarouselProps) {
  const cols = useGridColumns();
  const totalPages = Math.ceil(ads.length / cols);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  // Clamp page index when cols change and totalPages shrinks
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  if (safePage !== page) setPage(safePage);

  const slice = ads.slice(safePage * cols, (safePage + 1) * cols);

  function goTo(next: number) {
    setDir(next > safePage ? 1 : -1);
    setPage(next);
  }

  return (
    <div>
      {/* ── Card grid with animated page transitions ───────────────── */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={`${safePage}-${cols}`}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`grid items-stretch gap-4 ${COLS_CLASS[cols] ?? "grid-cols-1"}`}
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
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 0}
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
                aria-current={i === safePage ? "page" : undefined}
                className={[
                  "h-2 rounded-full transition-[width,background-color] duration-220",
                  i === safePage
                    ? "w-6 bg-ocean dark:bg-blue-chill"
                    : "w-2 bg-stone-300 dark:bg-white/20",
                ].join(" ")}
              />
            ))}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => goTo(safePage + 1)}
            disabled={safePage === totalPages - 1}
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
