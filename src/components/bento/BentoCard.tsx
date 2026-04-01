import type { ReactNode, CSSProperties } from "react";

export interface BentoCardProps {
  children: ReactNode;
  /** Grid span configuration for column and/or row */
  span?: { col?: number; row?: number };
  /** Visual variant controlling surface and border treatment */
  variant?: "default" | "gold" | "hero" | "stat";
  /** Enables CSS-only hover lift and gold border emphasis */
  hoverable?: boolean;
  className?: string;
}

const variantClasses: Record<NonNullable<BentoCardProps["variant"]>, string> = {
  default: "bg-white border border-khaki/30 dark:bg-ocean-card dark:border-luxborder",
  gold: "bg-ocean/6 border border-ocean/20 dark:bg-blue-chill/10 dark:border-blue-chill/25",
  hero: "bg-gradient-to-br from-ocean-deep to-ocean dark:from-ocean-900 dark:to-ocean-deep",
  stat: "bg-tan/50 border border-khaki/30 dark:bg-ocean-card2 dark:border-luxborder",
};

export function BentoCard({
  children,
  span,
  variant = "default",
  hoverable = false,
  className = "",
}: BentoCardProps) {
  const style: CSSProperties = {};
  if (span?.col) style.gridColumn = `span ${span.col}`;
  if (span?.row) style.gridRow = `span ${span.row}`;

  return (
    <div
      className={[
        "rounded-[14px] overflow-hidden relative",
        variantClasses[variant],
        hoverable
          ? "transition-[transform,border-color] duration-[220ms] ease-out hover:-translate-y-[2px] hover:border-blue-chill/30"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
