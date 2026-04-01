import type { ReactNode } from "react";

export interface BentoGridProps {
  /** CSS grid-template-columns value, e.g. "1fr 1fr 280px" */
  columns?: string;
  /** CSS grid-template-rows value, e.g. "260px 180px" */
  rows?: string;
  /** Gap between grid items in pixels (default 10) */
  gap?: number;
  className?: string;
  children: ReactNode;
}

export function BentoGrid({
  columns = "1fr",
  rows,
  gap = 10,
  className = "",
  children,
}: BentoGridProps) {
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: columns,
        ...(rows ? { gridTemplateRows: rows } : {}),
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}
