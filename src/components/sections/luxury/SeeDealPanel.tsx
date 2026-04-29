"use client";

import Link from "next/link";
import { Check, Tag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { HeroDeal } from "@/hooks/useHeroDeal";

export interface SeeDealPanelProps {
  deal: HeroDeal;
}

/**
 * Sales + marketing panel for the currently highlighted hero slide.
 * Lazy-loaded via next/dynamic in SeeDealButton — forms its own JS chunk.
 */
export default function SeeDealPanel({ deal }: SeeDealPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 overflow-hidden rounded-[14px] border border-white/10 bg-ocean-deep/92 shadow-2xl backdrop-blur-xl"
      role="dialog"
      aria-label={`Deal details: ${deal.title}`}
    >
      {/* Thumbnail strip */}
      <div className="relative h-28 w-full overflow-hidden">
        <img
          src={deal.imgSrc}
          alt={deal.imgAlt}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 to-transparent"
          aria-hidden="true"
        />
        {deal.badge && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ocean/90 px-2.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
            <Tag size={8} aria-hidden="true" />
            {deal.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title + subtitle */}
        <div>
          <h3 className="font-sans text-[14px] font-semibold leading-snug text-white">
            {deal.title}
          </h3>
          <p className="mt-1 font-sans text-[11px] leading-relaxed text-white/55">
            {deal.subtitle}
          </p>
        </div>

        {/* Highlights */}
        <ul className="flex flex-col gap-1">
          {deal.highlights.map((h) => (
            <li key={h} className="flex items-center gap-1.5 font-sans text-[11px] text-white/65">
              <Check size={9} className="shrink-0 text-blue-chill-300" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>

        {/* Pricing */}
        {deal.price && (
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[20px] font-light leading-none text-blue-chill-300">
              {deal.price}
            </span>
            {deal.originalPrice && (
              <span className="font-sans text-[10px] text-white/35 line-through">
                {deal.originalPrice}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link
          href={deal.href}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-ocean px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-[transform,background-color] duration-220 ease-out hover:-translate-y-px hover:bg-blue-chill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill"
        >
          Book This Deal
          <ArrowRight size={11} aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}
