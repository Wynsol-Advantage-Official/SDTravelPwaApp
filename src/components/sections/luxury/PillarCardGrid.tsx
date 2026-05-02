"use client";

// ---------------------------------------------------------------------------
// PillarCardGrid -- paginated pillar card grid (client component)
// ---------------------------------------------------------------------------
// Receives pre-fetched Pillar items from the LuxuryWhyUs Server Component.
// The grid never wraps: itemsPerPage always equals the current column count.
// Resizing re-calculates the visible page automatically.
//
// Breakpoints:
//   < 640px  -> 1 col
//   640-1023 -> 2 cols
//   1024-1279-> 3 cols
//   >= 1280  -> 4 cols
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Pillar {
  id: string;
  image: string;
  imageAlt: string;
  title: string;
  body: string;
  href: string;
}

interface PillarCardGridProps {
  pillars: Pillar[];
}

// ---------------------------------------------------------------------------
// Responsive column logic
// ---------------------------------------------------------------------------

/** [minWidth, columns] — evaluated highest-first */
const BREAKPOINTS: [number, number][] = [
  [1280, 3],
  [1024, 2],
  [640, 1],
];

const COLS_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

function getColumns(): number {
  if (typeof window === "undefined") return 1;
  for (const [minW, cols] of BREAKPOINTS) {
    if (window.matchMedia(`(min-width: ${minW}px)`).matches) return cols;
  }
  return 1;
}

/** Returns the current column count; updates on viewport resize. */
function useGridColumns(): number {
  const [cols, setCols] = useState<number>(getColumns);

  useEffect(() => {
    const mqs = BREAKPOINTS.map(([minW, c]) => ({
      mq: window.matchMedia(`(min-width: ${minW}px)`),
      cols: c,
    }));
    function update() {
      setCols(getColumns());
    }
    mqs.forEach(({ mq }) => mq.addEventListener("change", update));
    return () => mqs.forEach(({ mq }) => mq.removeEventListener("change", update));
  }, []);

  return cols;
}

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -56 : 56, opacity: 0 }),
};

// ---------------------------------------------------------------------------
// PillarCard -- Image Offset design
// ---------------------------------------------------------------------------
// Stacked layers (back to front):
//   1. Gold brush-stroke accent rectangle (rotated, blurred)
//   2. Offset ghost frame (border only, slightly right+down)
//   3. Main image with white border and drop shadow
// ---------------------------------------------------------------------------

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <article className="group flex flex-col gap-6 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-220 ease-out hover:-translate-y-0.5 hover:border-ocean/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-ocean-card dark:hover:border-blue-chill/20">
      {/* ---- Image Offset block ---- */}
      <div className="relative h-44 w-full select-none">
        {/* Layer 1: gold brush-stroke accent */}
        <div
          aria-hidden="true"
          className="absolute bottom-1 left-1 h-[82%] w-[60%] rounded-xl bg-amber-300/60 blur-[2px]"
          style={{ transform: "rotate(-4deg)" }}
        />

        {/* Layer 2: ghost offset frame */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-[92%] w-[88%] rounded-xl border-2 border-white/70 dark:border-white/20"
          style={{ transform: "translate(6px, 6px)" }}
        />

        {/* Layer 3: main image */}
        <div className="absolute inset-0 overflow-hidden rounded-xl border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.14)] transition-transform duration-500 ease-out group-hover:scale-[1.015] dark:border-white/30">
          <Image
            src={pillar.image}
            alt={pillar.imageAlt}
            fill
            sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 33vw"
            className="object-cover"
            style={{ objectPosition: "center top" }}
          />
        </div>
      </div>

      {/* ---- Text content ---- */}
      <div className="flex flex-col">
        <h3 className="font-sans text-[12px] font-bold uppercase tracking-widest text-ocean-deep dark:text-white">
          {pillar.title}
        </h3>

        <p className="mt-2 font-sans text-[13px] leading-relaxed text-ocean-deep/60 dark:text-white/60">
          {pillar.body}
        </p>

        <Link
          href={pillar.href}
          className="mt-4 inline-flex w-fit items-center gap-1 font-sans text-[12px] font-semibold text-ocean transition-colors hover:text-ocean-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean dark:text-blue-chill dark:hover:text-blue-chill-300"
        >
          Learn More
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// PillarCardGrid
// ---------------------------------------------------------------------------

export function PillarCardGrid({ pillars }: PillarCardGridProps) {
  const cols = useGridColumns();
  const totalPages = Math.ceil(pillars.length / cols);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  // Clamp page when viewport resize shrinks totalPages
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  if (safePage !== page) setPage(safePage);

  const slice = pillars.slice(safePage * cols, (safePage + 1) * cols);

  function goTo(next: number) {
    setDir(next > safePage ? 1 : -1);
    setPage(next);
  }

  return (
    <div>
      {/* ---- Animated card grid ---- */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={`page-${safePage}-cols-${cols}`}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`grid items-stretch gap-6 ${COLS_CLASS[cols] ?? "grid-cols-1"}`}
          >
            {slice.map((pillar) => (
              <PillarCard key={pillar.id} pillar={pillar} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- Prev / Next navigation (only when multiple pages) ---- */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {/* Previous */}
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
          <div className="flex items-center gap-2" role="group" aria-label="Pillar pages">
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
