"use client";

import { type CSSProperties, type ReactNode, type RefObject, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type UseScrollOptions,
} from "framer-motion";

export interface ParallaxLayerProps {
  children: ReactNode;
  /** External ref of the element to track scroll progress for. When omitted,
   *  the component's own outer container is used as the scroll target. */
  targetRef?: RefObject<HTMLElement | null>;
  /** Framer Motion scroll offset (e.g. ["start end", "end start"]).
   *  Passed directly to useScroll({ offset }). */
  offset?: UseScrollOptions["offset"];
  /** [from, to] translateY in px mapped to scroll progress [0, 1]. */
  yRange?: [number, number];
  /** [from, to] scale mapped to scroll progress [0, 1]. */
  scaleRange?: [number, number];
  /** [from, to] opacity mapped to scroll progress [0, 1]. */
  opacityRange?: [number, number];
  /** Disables all motion transforms regardless of reduced-motion preference. */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Scroll-linked transform wrapper powered by Framer Motion useScroll +
 * useTransform. Animates only GPU-safe properties (translateY, scale, opacity).
 *
 * Renders a plain <div> (no transforms) when:
 *  - `disabled` is true, OR
 *  - the user has `prefers-reduced-motion: reduce` (detected via useReducedMotion)
 */
export function ParallaxLayer({
  children,
  targetRef,
  offset,
  yRange,
  scaleRange,
  opacityRange,
  disabled = false,
  className,
  style,
}: ParallaxLayerProps) {
  const shouldReduceMotion = useReducedMotion();

  // Internal ref used as scroll target when no external targetRef is provided.
  const innerRef = useRef<HTMLDivElement>(null);
  const resolvedTarget = targetRef ?? innerRef;

  const scrollOptions: UseScrollOptions = { target: resolvedTarget };
  if (offset) {
    scrollOptions.offset = offset;
  }

  const { scrollYProgress } = useScroll(scrollOptions);

  // Hooks must always be called — use identity ranges when a range is not supplied
  // so the resulting MotionValue is a no-op that is simply not applied to the style.
  const y = useTransform(scrollYProgress, [0, 1], yRange ?? [0, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange ?? [1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], opacityRange ?? [1, 1]);

  // Reduced-motion or explicitly disabled — static render, no transforms.
  if (shouldReduceMotion || disabled) {
    return (
      <div ref={innerRef} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={innerRef}
      className={className}
      style={{
        ...style,
        ...(yRange ? { y } : {}),
        ...(scaleRange ? { scale } : {}),
        ...(opacityRange ? { opacity } : {}),
      }}
    >
      {children}
    </motion.div>
  );
}
