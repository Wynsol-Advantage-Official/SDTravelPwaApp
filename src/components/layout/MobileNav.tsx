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
        className="fixed inset-0 z-40 bg-charcoal/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <motion.nav
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-charcoal px-6 pb-8 pt-20 md:hidden"
        aria-label="Mobile navigation"
      >
        <ul className="space-y-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className="block font-serif text-xl text-diamond transition-colors hover:text-gold"
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
            className="flex h-12 w-full items-center justify-center rounded-sm bg-gold text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:bg-gold-400"
          >
            Book Now
          </Link>
        </div>
      </motion.nav>
    </>
  )
}
