// ---------------------------------------------------------------------------
// AdTourCard — Tour-style ad card (image-top, white body, dual CTAs)
// ---------------------------------------------------------------------------
// Inspired by the tour-card design: cover image header, clean white content
// area, "Easy Quote" (outline) + "View Deal" (filled) button pair at bottom.
// ---------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { formatAdTitle } from "@/lib/rules/ads-rules";
import type { Ad } from "@/types/ad";

interface AdTourCardProps {
  ad: Ad;
}

export function AdTourCard({ ad }: AdTourCardProps) {
  const title = formatAdTitle(ad.title);
  const href = ad.href ?? "/tours";

  return (
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-[transform,box-shadow] duration-220 ease-out hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-ocean-card"
      {/* ── Cover image ──────────────────────────────────────────────── */}
      <div className="relative h-50 w-full shrink-0 overflow-hidden">
        <Image
          src={ad.cover.src}
          alt={ad.cover.alt || title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Sponsored badge */}
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-ocean-deep/80 px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
          <Tag size={9} aria-hidden="true" />
          Sponsored
        </span>
      </div>

      {/* ── Content body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        {/* Title */}
        <h3 className="line-clamp-2 font-sans text-[17px] font-bold leading-snug text-ocean-deep dark:text-white">
          {title}
        </h3>

        {/* Eyebrow */}
        <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-ocean/60 dark:text-blue-chill/60">
          Luxury Travel · Exclusive Offer
        </p>

        {/* Divider */}
        <div className="my-3 h-px bg-stone-100 dark:bg-white/10" />

        {/* Push CTAs to bottom */}
        <div className="flex-1" />

        {/* ── CTA row ──────────────────────────────────────────────── */}
        <div className="flex gap-2">
          <Link
            href="/contact"
            className="flex flex-1 items-center justify-center rounded-lg border border-ocean px-3 py-2.5 font-sans text-[10px] font-bold uppercase tracking-widest text-ocean transition-colors duration-150 hover:bg-ocean hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean dark:border-blue-chill dark:text-blue-chill dark:hover:bg-blue-chill dark:hover:text-ocean-deep"
          >
            Easy Quote
          </Link>
          <Link
            href={href}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ocean px-3 py-2.5 font-sans text-[10px] font-bold uppercase tracking-widest text-white transition-colors duration-150 hover:bg-ocean-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean dark:bg-blue-chill dark:text-ocean-deep dark:hover:bg-blue-chill-300"
          >
            View Deal
            <ArrowRight size={11} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
