"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

interface RevealProps {
  /** Additional delay in ms before the animation starts. Default 0 */
  delayMs?: number;
  /** If true, element stays revealed after first intersection. Default true */
  once?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps children in a div that fades up into view using the `animate-fade-up`
 * CSS keyframe from tailwind.config.ts.
 *
 * Respects `prefers-reduced-motion`: when reduced motion is preferred the
 * transform is skipped and content appears instantly with a simple opacity
 * transition.
 */
export function Reveal({ delayMs = 0, once = true, children }: RevealProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ once });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Reduced motion: instant show (no transform, just opacity snap)
  if (prefersReducedMotion) {
    return (
      <div
        ref={ref}
        style={{ opacity: isInView ? 1 : 0, transition: "opacity 0.15s ease" }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={isInView ? "animate-fade-up" : ""}
      style={{
        opacity: isInView ? undefined : 0,
        animationDelay: isInView ? `${delayMs}ms` : undefined,
        animationFillMode: "forwards",
      }}
    >
      {children}
    </div>
  );
}
