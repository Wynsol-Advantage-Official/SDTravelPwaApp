import Link from "next/link"
import Image from "next/image"

const FOOTER_LINKS = {
  Explore: [
    { href: "/tours", label: "All Tours" },
    { href: "/destinations", label: "Destinations" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
  Account: [
    { href: "/dashboard", label: "My Diamonds" },
    { href: "/dashboard/saved", label: "Saved Tours" },
    { href: "/dashboard/bookings", label: "My Bookings" },
  ],
} as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-khaki/50 bg-tan transition-colors duration-300 dark:border-white/10 dark:bg-ocean-deep">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logos/brand/full_colour.svg"
                alt="Sand Diamonds Travel"
                width={140}
                height={48}
                className="h-10 w-auto dark:hidden"
              />
              <Image
                src="/logos/brand/white_solid.svg"
                alt="Sand Diamonds Travel"
                width={140}
                height={48}
                className="hidden h-10 w-auto dark:block"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ocean-deep/60 dark:text-white/60">
              Bespoke luxury travel, curated with concierge-level attention to
              every detail.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ocean-deep/50 dark:text-tan">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-ocean-deep/55 transition-colors hover:text-ocean dark:text-white/60 dark:hover:text-blue-chill-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-khaki/40 pt-6 text-center text-xs text-ocean-deep/40 dark:border-white/10 dark:text-white/40">
          © {year} Sand Diamonds Travel. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
