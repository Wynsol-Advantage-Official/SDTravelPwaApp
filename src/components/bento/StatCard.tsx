import { BentoCard } from "./BentoCard";
import type { CSSProperties } from "react";

export interface StatCardProps {
  /** Display value, e.g. "200+" or "4.9" */
  value: string;
  /** Descriptive label beneath the value */
  label: string;
  /** Grid span passthrough for BentoGrid placement */
  span?: { col?: number; row?: number };
  className?: string;
}

export function StatCard({ value, label, span, className = "" }: StatCardProps) {
  return (
    <BentoCard variant="stat" span={span} className={`p-4 ${className}`}>
      <div className="flex flex-col items-center justify-center text-center h-full">
        <span className="font-display text-[42px] font-light leading-none text-ocean dark:text-blue-chill-300">
          {value}
        </span>
        <span className="mt-2 font-sans text-[11px] uppercase tracking-[0.16em] text-ocean-deep/55 dark:text-white/60">
          {label}
        </span>
      </div>
    </BentoCard>
  );
}
