"use client";

import { CSSProperties, ReactNode, useState } from "react";
import { motion, Variants, useReducedMotion } from "framer-motion";

export interface Card3DRevealProps {
  children: ReactNode;
  index?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  delayMs?: number;
  durationMs?: number;
  distance?: number;
  rotateXFrom?: number;
  rotateYFrom?: number;
  depthFrom?: number;
  className?: string;
  style?: CSSProperties;
}

export function Card3DReveal({
  children,
  index,
  once = true,
  amount = 0.15,
  delayMs = 0,
  durationMs = 600,
  distance = 40,
  rotateXFrom = 12,
  rotateYFrom = 0,
  depthFrom = -30,
  className,
  style,
}: Card3DRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [animationDone, setAnimationDone] = useState(false);

  const delay = (index ?? 0) * 0.1 + delayMs / 1000;

  if (prefersReducedMotion) {
    // NOTE: className applies to the outer perspective host — callers must NOT add
    // overflow-hidden to this element (Safari clips 3D children when perspective host
    // has overflow-hidden). overflow-hidden is safe on the inner motion.div only.
    return (
      <div style={{ perspective: "900px", ...style }} className={className}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once, amount }}
          transition={{ duration: 0.3, ease: "easeOut", delay }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  const variants: Variants = {
    hidden: {
      opacity: 0,
      rotateX: rotateXFrom,
      rotateY: rotateYFrom,
      translateY: distance,
      translateZ: depthFrom,
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      translateY: 0,
      translateZ: 0,
      transition: {
        duration: durationMs / 1000,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    // NOTE: className applies to the outer perspective host — callers must NOT add
    // overflow-hidden to this element (Safari clips 3D children when perspective host
    // has overflow-hidden). overflow-hidden is safe on the inner motion.div only.
    <div style={{ perspective: "900px", ...style }} className={className}>
      {/* Inner motion.div: overflow-hidden safe here, separate from perspective host */}
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        style={{
          willChange: animationDone ? "auto" : "transform, opacity",
          transformStyle: "preserve-3d",
        }}
        onAnimationComplete={() => setAnimationDone(true)}
      >
        {children}
      </motion.div>
    </div>
  );
}
