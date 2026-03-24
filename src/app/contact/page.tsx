import type { Metadata } from "next"
import Link from "next/link"
import { ContactForm } from "@/components/contact/ContactForm"
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide"

// ---------------------------------------------------------------------------
// /contact — Contact Page (Server Component)
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Contact Us | Sand Diamonds Travel",
  description:
    "Get in touch with our luxury travel concierge team. " +
    "We're here to help plan your dream trip, answer questions, or craft a bespoke itinerary.",
  openGraph: {
    title: "Contact Us | Sand Diamonds Travel",
    description:
      "Reach our concierge team for luxury travel inquiries, custom itineraries, and booking assistance.",
  },
}

const CONTACT_CHANNELS = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    value: "hello@sanddiamondstravel.com",
    href: "mailto:hello@sanddiamondstravel.com",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: "Phone",
    value: "+27 (0) 21 000 0000",
    href: "tel:+27210000000",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: "Location",
    value: "Cape Town, South Africa",
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-dvh bg-diamond">
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <section className="bg-charcoal px-6 pb-16 pt-24 text-center">
        <FadeSlide>
          <FadeSlideChild>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              Get In Touch
            </p>
          </FadeSlideChild>
          <FadeSlideChild>
            <h1 className="font-serif text-4xl font-bold text-diamond sm:text-5xl">
              Contact Us
            </h1>
          </FadeSlideChild>
          <FadeSlideChild>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-diamond/70">
              Have a question, need help with a booking, or ready to start
              planning your dream journey? Our concierge team is here to help.
            </p>
          </FadeSlideChild>
        </FadeSlide>
      </section>

      {/* ── Contact Channels ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 grid gap-6 sm:grid-cols-3">
          {CONTACT_CHANNELS.map((ch) => (
            <div
              key={ch.label}
              className="flex flex-col items-center rounded-lg border border-charcoal/5 bg-white p-8 text-center shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                {ch.icon}
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                {ch.label}
              </h3>
              {ch.href ? (
                <Link
                  href={ch.href}
                  className="mt-1 text-sm font-medium text-ocean transition-colors hover:text-gold"
                >
                  {ch.value}
                </Link>
              ) : (
                <p className="mt-1 text-sm font-medium text-charcoal">
                  {ch.value}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── Form Section ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-xl">
          <FadeSlide className="mb-10 text-center">
            <FadeSlideChild>
              <h2 className="font-serif text-2xl font-bold text-charcoal sm:text-3xl">
                Send Us a Message
              </h2>
            </FadeSlideChild>
            <FadeSlideChild>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
                Fill out the form below and our team will get back to you within
                24 hours.
              </p>
            </FadeSlideChild>
          </FadeSlide>

          <ContactForm />
        </div>
      </section>
    </main>
  )
}
