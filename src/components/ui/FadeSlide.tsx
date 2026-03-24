"use client";

import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Framer Motion wrapper — "fade-and-slide" entrance animation
// ---------------------------------------------------------------------------
// This is a Client Component because Framer Motion requires browser APIs.
// Keep it thin: the actual page content in `page.tsx` stays a Server Component
// and is passed in as `children`.
// ---------------------------------------------------------------------------

const fadeSlideVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      staggerChildren: 0.12,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

interface FadeSlideProps {
  children: React.ReactNode;
  className?: string;
}

export function FadeSlide({ children, className }: FadeSlideProps) {
  return (
    <motion.div
      variants={fadeSlideVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeSlideChild({ children, className }: FadeSlideProps) {
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}
