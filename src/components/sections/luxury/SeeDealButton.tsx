"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tag } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type { HeroDeal } from "@/hooks/useHeroDeal";

// Code-split: SeeDealPanel is loaded only on first hover — separate JS chunk
const SeeDealPanel = dynamic(() => import("./SeeDealPanel"), {
  ssr: false,
  loading: () => null,
});

export interface SeeDealButtonProps {
  deal: HeroDeal | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

/**
 * Floating "See Deals" trigger anchored to the bottom-right of the hero card.
 * Hovering pauses the carousel autoplay (via callbacks) and reveals the deal panel.
 * Desktop only — hidden below lg breakpoint.
 */
export function SeeDealButton({ deal, onHoverStart, onHoverEnd }: SeeDealButtonProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  if (!deal) return null;

  return (
    <div
      className="absolute bottom-20 right-6 z-30 hidden flex-col items-end gap-2 lg:flex"
      onMouseEnter={() => {
        setPanelOpen(true);
        onHoverStart();
      }}
      onMouseLeave={() => {
        setPanelOpen(false);
        onHoverEnd();
      }}
    >
      {/* Panel — stacks above the button (flex-col order: panel first, button second) */}
      <AnimatePresence>
        {panelOpen && <SeeDealPanel deal={deal} />}
      </AnimatePresence>

      {/* Trigger pill */}
      <button
        type="button"
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-white shadow-lg backdrop-blur-sm transition-[transform,background-color,border-color] duration-220 ease-out hover:-translate-y-px hover:border-white/30 hover:bg-ocean/80"
      >
        <Tag size={11} aria-hidden="true" />
        See Deals
      </button>
    </div>
  );
}
