import Link from "next/link"
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide"

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-sand blur-3xl" />
      </div>

      <FadeSlide className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <FadeSlideChild>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold">
            Begin Your Journey
          </p>
        </FadeSlideChild>

        <FadeSlideChild>
          <h2 className="font-serif text-3xl font-bold text-diamond sm:text-4xl lg:text-5xl">
            Your Next Diamond
            <br />
            <span className="text-sand">Awaits</span>
          </h2>
        </FadeSlideChild>

        <FadeSlideChild>
          <p className="mx-auto mt-6 max-w-xl text-base text-diamond/70">
            Whether you dream of ancient ruins, alpine retreats, or secluded
            island escapes — our concierge team crafts every detail so you
            simply enjoy the moment.
          </p>
        </FadeSlideChild>

        <FadeSlideChild>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/tours"
              className="inline-flex h-14 items-center rounded-sm bg-gold px-8 text-sm font-semibold uppercase tracking-wider text-charcoal transition-colors hover:bg-gold/90"
            >
              Browse All Tours
            </Link>
            <Link
              href="/dashboard/chat"
              className="inline-flex h-14 items-center rounded-sm border border-diamond/30 px-8 text-sm font-semibold uppercase tracking-wider text-diamond transition-colors hover:border-gold hover:text-gold"
            >
              Chat With a Concierge
            </Link>
          </div>
        </FadeSlideChild>
      </FadeSlide>
    </section>
  )
}
