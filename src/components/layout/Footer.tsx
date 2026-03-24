import Link from "next/link"

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
    <footer className="border-t border-diamond/10 bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="font-serif text-xl font-bold text-diamond">
              Sand&nbsp;Diamonds
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-diamond/60">
              Bespoke luxury travel, curated with concierge-level attention to
              every detail.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-diamond/60 transition-colors hover:text-gold"
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
        <div className="mt-12 border-t border-diamond/10 pt-6 text-center text-xs text-diamond/40">
          © {year} Sand Diamonds Travel. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
