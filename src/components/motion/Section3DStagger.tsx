"use client";

import { ReactNode } from "react";
import { motion, Variants } from "framer-motion";

export interface Section3DStaggerProps {
  children: ReactNode;
  staggerMs?: number;
  delayChildrenMs?: number;
  once?: boolean;
  className?: string;
}

export function Section3DStagger({
  children,
  staggerMs = 100,
  delayChildrenMs = 0,
  once = true,
  className,
}: Section3DStaggerProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerMs / 1000,
        delayChildren: delayChildrenMs / 1000,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
