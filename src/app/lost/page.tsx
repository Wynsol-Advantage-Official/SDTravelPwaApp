import Image from "next/image"
import Link from "next/link"
import { MapPin, Home, Compass, Phone, Gem } from "lucide-react"

// ---------------------------------------------------------------------------
// /lost — Unknown subdomain landing page
// Shown when a visitor hits an unrecognised subdomain.
// ---------------------------------------------------------------------------

export const metadata = {
  title: "You Might Be Lost — Sand Diamonds Travel",
  description: "We couldn't find the portal you're looking for. Let us help you find your way.",
}

const QUICK_LINKS = [
  {
    href: "https://www.sanddiamonds.travel",
    label: "Main Website",
    description: "Browse tours, destinations & more",
    icon: Home,
    external: true,
  },
  {
    href: "https://www.sanddiamonds.travel/destinations",
    label: "Destinations",
    description: "Explore luxury travel destinations",
    icon: MapPin,
    external: true,
  },
  {
    href: "https://www.sanddiamonds.travel/tours",
    label: "Tour Packages",
    description: "Curated diamond-class journeys",
    icon: Compass,
    external: true,
  },
  {
    href: "https://www.sanddiamonds.travel/contact",
    label: "Contact Us",
    description: "Speak with a concierge advisor",
    icon: Phone,
    external: true,
  },
]

export default function LostPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-tan-50 px-4 py-20 dark:bg-luxury-base">

      {/* Subtle background diamond pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)",
          backgroundSize: "30px 30px",
          color: "var(--brand-ocean-deep, #043750)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">

        {/* Logo */}
        <Link href="https://www.sanddiamonds.travel" aria-label="Sand Diamonds Travel — Home">
          <Image
            src="/logos/brand/full_colour.svg"
            alt="Sand Diamonds Travel"
            width={160}
            height={54}
            className="mb-10 h-14 w-auto dark:brightness-0 dark:invert"
            priority
          />
        </Link>

        {/* Gem icon accent */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-ocean/20 bg-white shadow-md dark:border-blue-chill/20 dark:bg-ocean-card">
          <Gem className="h-9 w-9 text-ocean dark:text-blue-chill" />
        </div>

        {/* Headline */}
        <h1 className="mb-4 font-serif text-3xl font-bold leading-tight tracking-tight text-ocean-deep sm:text-4xl dark:text-tan-100">
          You might be lost —{" "}
          <span className="text-ocean dark:text-blue-chill">fear not.</span>
        </h1>

        {/* Body copy */}
        <p className="mb-2 max-w-lg font-sans text-base leading-relaxed text-ocean-deep/70 dark:text-tan-100/70">
          We couldn&apos;t find the portal you&apos;re looking for, but we are{" "}
          <em>here to help you find your way</em>. Every journey starts somewhere —
          let ours begin together.
        </p>

        <p className="mb-10 font-sans text-sm text-ocean-deep/45 dark:text-tan-100/40">
          If you were expecting a specific travel portal, please check the link you followed
          or contact your travel advisor.
        </p>

        {/* Quick-link cards */}
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, description, icon: Icon, external }) => (
            <Link
              key={href}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex items-start gap-4 rounded-xl border border-ocean-deep/10 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-ocean/30 hover:shadow-md dark:border-tan-100/10 dark:bg-ocean-card dark:hover:border-blue-chill/30"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ocean/8 text-ocean transition-colors group-hover:bg-ocean/15 dark:bg-blue-chill/10 dark:text-blue-chill dark:group-hover:bg-blue-chill/20">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-sans text-sm font-semibold text-ocean-deep dark:text-tan-100">
                  {label}
                </p>
                <p className="mt-0.5 font-sans text-xs text-ocean-deep/55 dark:text-tan-100/55">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="https://www.sanddiamonds.travel"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ocean px-8 font-sans text-sm font-semibold text-white shadow transition-colors hover:bg-blue-chill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            Take me home
          </Link>
          <Link
            href="https://www.sanddiamonds.travel/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ocean/25 px-8 font-sans text-sm font-semibold text-ocean transition-colors hover:border-ocean/50 hover:bg-ocean/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean dark:border-blue-chill/25 dark:text-blue-chill dark:hover:border-blue-chill/50 dark:hover:bg-blue-chill/5"
          >
            Talk to an advisor
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-14 font-sans text-xs text-ocean-deep/30 dark:text-tan-100/25">
          © {new Date().getFullYear()} Sand Diamonds Travel Ltd. &nbsp;·&nbsp; Where Every Journey Becomes a Diamond
        </p>
      </div>
    </main>
  )
}
