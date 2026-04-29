"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

interface HomeMotionConfigProps {
  children: ReactNode;
}

export function HomeMotionConfig({ children }: HomeMotionConfigProps) {
  return (
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  );
}
