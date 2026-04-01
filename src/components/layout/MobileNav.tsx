"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface MobileNavProps {
  links: ReadonlyArray<{ href: string; label: string }>
  onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const panelVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring" as const, damping: 28, stiffness: 300 } },
  exit: { x: "100%", transition: { duration: 0.2 } },
}

export function MobileNav({ links, onClose }: MobileNavProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-40 bg-ocean-deep/40 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <motion.nav
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white px-6 pb-8 pt-20 md:hidden dark:bg-ocean-deep"
        aria-label="Mobile navigation"
      >
        <ul className="space-y-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className="block font-sans text-xl text-ocean-deep transition-colors hover:text-ocean dark:text-white dark:hover:text-blue-chill-300"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Link
            href="/tours"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-sm bg-ocean text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-blue-chill"
          >
            Book Now
          </Link>
        </div>
      </motion.nav>
    </>
  )
}
