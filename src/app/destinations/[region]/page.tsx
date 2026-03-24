import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Sun, Wind, Calendar, ArrowRight, Compass } from "lucide-react"
import { getDestinations, getDestinationBySlug, getTours } from "@/lib/wix/tours"
import { generateDestinationMetadata } from "@/lib/utils/seo"
import { TourCard } from "@/components/tours/TourCard"
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide"
import { faker } from "@/lib/demo/faker"

export const revalidate = 300

interface DestRegionPageProps {
  params: Promise<{ region: string }>
}

export async function generateStaticParams() {
  const destinations = await getDestinations()
  return destinations.map((d) => ({ region: d.slug }))
}

export async function generateMetadata({
  params,
}: DestRegionPageProps): Promise<Metadata> {
  const { region } = await params
  const dest = await getDestinationBySlug(region)
  if (!dest) return { title: "Destination Not Found" }
  return generateDestinationMetadata({
    name: dest.name,
    region: dest.region,
    slug: dest.slug,
    seoTitle: dest.seoTitle,
    seoDescription: dest.seoDescription,
    heroImageSrc: dest.heroImage.src,
  })
}

const DEFAULT_SRC = "/og/default.jpg"

export default async function DestinationRegionPage({
  params,
}: DestRegionPageProps) {
  const { region } = await params
  const [dest, allTours] = await Promise.all([
    getDestinationBySlug(region),
    getTours(),
  ])

  if (!dest) notFound()

  const regionTours = allTours.filter(
    (t) =>
      t.destination?.slug === dest.slug ||
      t.destination?.name === dest.name,
  )

  const hasHero = dest.heroImage?.src && dest.heroImage.src !== DEFAULT_SRC
  const galleryImgs = (dest.gallery ?? []).filter(
    (g) => g.src && g.src !== DEFAULT_SRC,
  )

  // Demo filler for missing CMS fields
  const demo = {
    tagline: faker.company.catchPhrase(),
    highlight1: faker.hacker.phrase(),
    highlight2: faker.hacker.phrase(),
    highlight3: faker.hacker.phrase(),
    policies: faker.lorem.sentences(2),
  }

  return (
    <main className="min-h-dvh bg-diamond">
      {/* ── Full-bleed hero ──────────────────────────────────────── */}
      <section className="hero relative min-h-[75vh] items-end overflow-hidden bg-charcoal">
        {hasHero ? (
          <Image
            src={dest.heroImage.src}
            alt={dest.heroImage.alt || dest.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-ocean/40 to-charcoal" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />

        <FadeSlide className="hero-content relative z-10 mx-auto w-full max-w-7xl self-end px-6 pb-16">
          <div className="w-full">
          <div className="mb-4">
            <Link
              href="/destinations"
              className="btn btn-ghost btn-sm text-diamond/60 hover:text-gold"
            >
              ← All Destinations
            </Link>
          </div>
          <FadeSlideChild>
            <div className="badge badge-primary mb-4 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur-sm">
              <Compass className="h-3 w-3" /> {dest.region}
            </div>
          </FadeSlideChild>
          <FadeSlideChild>
            <h1 className="font-serif text-5xl font-bold text-diamond sm:text-6xl lg:text-7xl">
              {dest.name}
            </h1>
          </FadeSlideChild>
          <FadeSlideChild>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-diamond/75">
              {dest.description || demo.tagline}
            </p>
          </FadeSlideChild>
          </div>
        </FadeSlide>
      </section>

      {/* ── Bento info grid ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* Large gallery tile — col-span-2, row-span-2 */}
          <div className="relative col-span-1 overflow-hidden rounded-2xl md:col-span-2 md:row-span-2">
            {galleryImgs[0] ? (
              <div className="relative h-80 w-full md:h-[480px]">
                <Image
                  src={galleryImgs[0].src}
                  alt={galleryImgs[0].alt || dest.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="font-serif text-xl font-semibold text-diamond">
                    {dest.name} Gallery
                  </p>
                  <p className="mt-1 text-sm text-diamond/70">
                    {galleryImgs.length} photo{galleryImgs.length !== 1 ? "s" : ""} from our collection
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-sand/10 md:h-[480px]">
                <MapPin className="h-12 w-12 text-charcoal/20" />
              </div>
            )}
          </div>

          {/* Climate tile */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
                  <Sun className="h-4 w-4 text-gold" />
                </span>
                <span className="badge badge-ghost text-xs uppercase tracking-wider">Climate</span>
              </div>
              <h3 className="card-title font-serif text-lg">Best Time to Visit</h3>
              <p className="text-sm leading-relaxed text-charcoal/70">
                {dest.climate || demo.policies}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-charcoal/40">
                <Wind className="h-3.5 w-3.5" /> Verified by our concierge team
              </div>
            </div>
          </div>

          {/* Highlights tile */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10">
                  <Calendar className="h-4 w-4 text-ocean" />
                </span>
                <span className="badge badge-ghost text-xs uppercase tracking-wider">Highlights</span>
              </div>
              <h3 className="card-title font-serif text-lg">Must Experiences</h3>
              <ul className="space-y-2">
                {[demo.highlight1, demo.highlight2, demo.highlight3].map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-charcoal/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Gallery row ──────────────────────────────────────────── */}
        {galleryImgs.length > 1 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImgs.slice(1, 5).map((img, i) => (
              <div
                key={img.src + i}
                className="relative h-48 overflow-hidden rounded-2xl"
              >
                <Image
                  src={img.src}
                  alt={img.alt || dest.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Tours for this destination ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Discover
            </p>
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              Tours in {dest.name}
            </h2>
          </div>
          {regionTours.length > 3 && (
            <Link
              href="/tours"
              className="hidden items-center gap-1.5 text-sm font-semibold text-ocean hover:text-gold sm:flex"
            >
              All tours <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {regionTours.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regionTours.map((tour, i) => (
              <TourCard key={tour._id} tour={tour} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-charcoal/20 py-20 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-charcoal/20" />
            <p className="font-serif text-lg text-charcoal/50">
              Tours for {dest.name} are coming soon.
            </p>
            <Link
              href="/tours"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean hover:text-gold"
            >
              Browse all tours <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="border-t border-charcoal/10 bg-charcoal py-16 text-center">
        <div className="badge badge-outline mb-4 border-gold/40 uppercase tracking-[0.3em] text-gold">
          Bespoke Travel
        </div>
        <h2 className="font-serif text-3xl font-bold text-diamond">
          Ready to explore {dest.name}?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-diamond/60">
          Our concierge team will craft a bespoke itinerary tailored exactly to you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/concierge" className="btn btn-primary">
            Talk to a Concierge
          </Link>
          <Link href="/destinations" className="btn btn-outline">
            All Destinations
          </Link>
        </div>
      </section>
    </main>
  )
}
