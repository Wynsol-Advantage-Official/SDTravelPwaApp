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
  default: "bg-luxury-card border border-luxborder",
  gold: "bg-luxgold-dim border border-luxborder-gold",
  hero: "bg-gradient-to-br from-luxury-card3 to-luxury-base",
  stat: "bg-luxury-card2 border border-luxborder",
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
          ? "transition-[transform,border-color] duration-[220ms] ease-out hover:-translate-y-[2px] hover:border-luxborder-gold"
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
