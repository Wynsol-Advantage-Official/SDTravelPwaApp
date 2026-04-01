"use client";

import React from "react";
import { Reveal } from "./Reveal";

interface RevealStaggerProps {
  /** Delay in ms between each child's reveal. Default 50 */
  staggerMs?: number;
  /** If true, children stay revealed after first intersection. Default true */
  once?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps each child in a `<Reveal>` with incrementally increasing delay
 * so children animate in sequence (stagger effect).
 */
export function RevealStagger({
  staggerMs = 50,
  once = true,
  children,
}: RevealStaggerProps) {
  const childArray = React.Children.toArray(children);

  return (
    <>
      {childArray.map((child, index) => (
        <Reveal key={index} delayMs={index * staggerMs} once={once}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
