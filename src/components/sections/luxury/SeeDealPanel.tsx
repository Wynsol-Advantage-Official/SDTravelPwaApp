"use client";

import Link from "next/link";
import { Check, Tag, ArrowRight, Sparkles, Star, Shield, Clock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import type { HeroDeal } from "@/hooks/useHeroDeal";

export interface SeeDealPanelProps {
  deal: HeroDeal;
}

/**
 * Full-height bespoke deal panel anchored to the hero's right edge.
 * Height is derived from the hero height (100dvh - 3.5rem) minus the
 * button container's bottom-20 offset and the trigger pill (~3rem).
 * Buttons are pinned to the bottom in a fixed footer outside the scroll area.
 * Lazy-loaded via next/dynamic in SeeDealButton — forms its own JS chunk.
 */
export default function SeeDealPanel({ deal }: SeeDealPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="w-80  h-[calc(100dvh-11.5rem)] flex flex-col overflow-hidden rounded-md border border-white/60 bg-ocean-deep/96 shadow-[0_32px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      role="dialog"
      aria-label={`Deal details: ${deal.title}`}
    >
      {/* ── Hero image (36% of panel height) ────────────────────────────── */}
      <div className="relative shrink-0 overflow-hidden uppercase" style={{ height: "36%" }}>
        <img
          src={deal.imgSrc}
          alt={deal.imgAlt}
          className="h-full w-full object-cover"
        />
        {/* Gradient scrim */}
        <div
          className="absolute inset-0 bg-linear-to-t from-ocean-deep/85 via-ocean-deep/20 to-transparent"
          aria-hidden="true"
        />

        {/* Badge */}
        {deal.badge && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ocean/90 px-2.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            <Tag size={8} aria-hidden="true" />
            {deal.badge}
          </span>
        )}

        {/* 5-star tier */}
        <div className="absolute right-3 top-3 flex items-center gap-0.5" aria-label="Five star experience">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={8} className="fill-blue-chill-300 text-blue-chill-300" aria-hidden="true" />
          ))}
        </div>

        {/* Title pinned to image bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-sans text-[15px] font-semibold leading-snug text-white drop-shadow-md">
            {deal.title}
          </h3>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">

        {/* Exclusivity line */}
        <div className="flex items-center gap-1.5">
          <Sparkles size={10} className="shrink-0 text-blue-chill-300" aria-hidden="true" />
          <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-blue-chill-300">
            Bespoke · Curated · Exclusive
          </span>
        </div>

        {/* Subtitle */}
        <p className="font-sans text-[11px] leading-relaxed text-white/60 -mt-2">
          {deal.subtitle}
        </p>

        {/* Divider */}
        <div className="h-px w-full bg-white/10" aria-hidden="true" />

        {/* What's Included */}
        <div className="flex flex-col gap-2">
          <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-white/40">
            What's Included
          </p>
          <ul className="flex flex-col gap-1.5">
            {deal.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 font-sans text-[11px] text-white/70">
                <Check size={10} className="mt-0.5 shrink-0 text-blue-chill-300" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/10" aria-hidden="true" />

        {/* Bespoke service features */}
        <div className="flex flex-col gap-2">
          <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-white/40">
            The Sand Diamond Difference
          </p>
          <ul className="flex flex-col gap-2">
            {[
              { icon: Shield, label: "White-glove planning", detail: "Every detail pre-arranged by your advisor" },
              { icon: Globe, label: "Private transfers", detail: "Door-to-door, no shared coaches" },
              { icon: Clock, label: "24 / 7 concierge", detail: "On-call support throughout your journey" },
            ].map(({ icon: Icon, label, detail }) => (
              <li key={label} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-chill/10">
                  <Icon size={9} className="text-blue-chill-300" aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-0">
                  <span className="font-sans text-[10px] font-semibold text-white/80">{label}</span>
                  <span className="font-sans text-[9px] text-white/45">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Diamond Concierge guarantee card */}
        <div className="rounded-xl border border-white/10 bg-white/4 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles size={9} className="text-blue-chill-300 shrink-0" aria-hidden="true" />
            <span className="font-sans text-[9px] uppercase tracking-[0.12em] text-white/40">
              Diamond Concierge Guarantee
            </span>
          </div>
          <p className="font-sans text-[10px] leading-relaxed text-white/55">
            From villa preferences to private dining reservations — your personal Sand Diamond advisor anticipates every need before you ask.
          </p>
        </div>

        {/* Pricing */}
        {deal.price && (
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[22px] font-light leading-none text-blue-chill-300">
              {deal.price}
            </span>
            {deal.originalPrice && (
              <span className="font-sans text-[10px] text-white/30 line-through">
                {deal.originalPrice}
              </span>
            )}
            <span className="ml-auto font-sans text-[9px] text-white/35">per person</span>
          </div>
        )}

      </div>

      {/* ── Pinned CTA footer ─────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col-2 gap-2  bg-black/30 border-white/50 px-4 py-3">
        <Link
          href={deal.href}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ocean px-3 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-[transform,background-color] duration-220 ease-out hover:-translate-y-px hover:bg-blue-chill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill"
        >
          Reserve Now
        </Link>

        <Link
          href={deal.href}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-white/55 transition-[transform,border-color,color] duration-220 ease-out hover:-translate-y-px hover:border-blue-chill/40 hover:text-blue-chill-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill"
        >
          View Deal
        </Link>
      </div>
    </motion.div>
  );
}