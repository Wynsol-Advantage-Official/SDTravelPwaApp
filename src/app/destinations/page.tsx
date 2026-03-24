import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Compass, Sun } from "lucide-react"
import { getDestinations } from "@/lib/wix/tours"
import { faker } from "@/lib/demo/faker"
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Destinations | Sand Diamonds Travel",
  description:
    "Explore our curated collection of luxury travel destinations — from Caribbean " +
    "beaches to African safaris and European cultural escapes.",
}

const DEFAULT_SRC = "/og/default.jpg"

export default async function DestinationsPage() {
  const destinations = await getDestinations()

  // Featured = first destination with a real hero image; rest fill bento tiles
  const withImage = destinations.filter(
    (d) => d.heroImage?.src && d.heroImage.src !== DEFAULT_SRC,
  )
  const featured = withImage[0] ?? destinations[0] ?? null
  const rest = destinations.filter((d) => d._id !== featured?._id)

  return (
    <main className="min-h-dvh bg-diamond">
      {/* ── Hero banner ──────────────────────────────────────────── */}
      <section className="hero relative min-h-[70vh] items-end overflow-hidden bg-charcoal">
        {featured?.heroImage?.src && featured.heroImage.src !== DEFAULT_SRC ? (
          <Image
            src={featured.heroImage.src}
            alt={featured.heroImage.alt || featured.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-ocean/40 to-charcoal" />
        )}

        {/* Gold grain overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />

        <div className="hero-content relative z-10 mx-auto w-full max-w-7xl self-end px-6 pb-16">
          <FadeSlide>
            <FadeSlideChild>
              <div className="badge badge-outline mb-4 gap-2 border-gold/40 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold backdrop-blur-sm">
                <Compass className="h-3 w-3" /> World-Class Luxury
              </div>
            </FadeSlideChild>
            <FadeSlideChild>
              <h1 className="font-serif text-5xl font-bold text-diamond sm:text-6xl lg:text-7xl">
                Our Destinations
              </h1>
            </FadeSlideChild>
            <FadeSlideChild>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-diamond/70">
                Each destination has been personally vetted by our concierge team
                to ensure an unforgettable experience.
              </p>
            </FadeSlideChild>
            {featured && (
              <FadeSlideChild>
                <Link
                  href={`/destinations/${featured.slug}`}
                  className="btn btn-primary mt-8"
                >
                  Explore {featured.name} →
                </Link>
              </FadeSlideChild>
            )}
          </FadeSlide>
        </div>
      </section>

      {/* ── Bento destination grid ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {destinations.length === 0 ? (
          // If the Wix collection is missing or empty, show demo placeholders
          // and an admin warning with debugging instructions so the site
          // owner can quickly identify the problem.
          <>
            <div className="mx-auto mb-6 max-w-3xl">
              <div className="alert alert-warning shadow-lg">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  <div>
                    <h3 className="font-bold">Destinations not available</h3>
                    <div className="text-sm">The Wix `Destinations1` collection is inaccessible. Check your Wix Headless OAuth credentials and collection permissions.</div>
                    <div className="mt-2 text-sm">Run the debug endpoint: <a href="/api/wix/debug/destinations" className="link link-primary">/api/wix/debug/destinations</a></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => {
                const name = faker.company.catchPhrase();
                const region = faker.company.catchPhrase().split(" ")[0];
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${i}`;
                const desc = faker.lorem.sentences(2);
                return (
                  <Link
                    key={`demo-${i}`}
                    href={`/destinations/${slug}`}
                    className="group relative overflow-hidden rounded-2xl"
                  >
                    <div className="relative h-56 w-full bg-charcoal/10">
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-sand/10 to-ocean/10">
                        <MapPin className="h-8 w-8 text-charcoal/20" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-transparent to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">{region}</p>
                      <h3 className="mt-0.5 font-serif text-xl font-bold text-diamond transition-colors group-hover:text-gold">{name}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-diamond/65">{desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <>
            {/* Featured large tile + 2 side tiles */}
            {featured && (
              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* Featured — 2/3 width */}
                <Link
                  href={`/destinations/${featured.slug}`}
                  className="group relative col-span-1 overflow-hidden rounded-2xl md:col-span-2"
                >
                  <div className="relative h-[420px] w-full bg-charcoal/10">
                    {featured.heroImage?.src && featured.heroImage.src !== DEFAULT_SRC ? (
                      <Image
                        src={featured.heroImage.src}
                        alt={featured.heroImage.alt || featured.name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-charcoal/10 to-ocean/10">
                        <MapPin className="h-12 w-12 text-charcoal/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-7">
                    <div className="badge badge-primary badge-sm mb-2 gap-1.5 backdrop-blur-sm">
                      <MapPin className="h-3 w-3" /> {featured.region}
                    </div>
                    <h2 className="mt-1 font-serif text-3xl font-bold text-diamond transition-colors group-hover:text-gold md:text-4xl">
                      {featured.name}
                    </h2>
                    {featured.description && (
                      <p className="mt-2 line-clamp-2 max-w-md text-sm text-diamond/70">
                        {featured.description}
                      </p>
                    )}
                    {featured.climate && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-gold/80">
                        <Sun className="h-3.5 w-3.5" /> {featured.climate}
                      </p>
                    )}
                  </div>
                  <div className="absolute right-4 top-4">
                    <span className="badge badge-warning font-bold uppercase tracking-wider shadow">Featured</span>
                  </div>
                </Link>

                {/* Side — stack 2 tiles at 1/3 width */}
                <div className="col-span-1 flex flex-col gap-3">
                  {rest.slice(0, 2).map((dest) => (
                    <Link
                      key={dest._id}
                      href={`/destinations/${dest.slug}`}
                      className="group relative flex-1 overflow-hidden rounded-2xl"
                    >
                      <div className="relative h-[202px] w-full bg-charcoal/10">
                        {dest.heroImage?.src && dest.heroImage.src !== DEFAULT_SRC ? (
                          <Image
                            src={dest.heroImage.src}
                            alt={dest.heroImage.alt || dest.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sand/10 to-ocean/10">
                            <MapPin className="h-8 w-8 text-charcoal/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
                          {dest.region}
                        </p>
                        <h3 className="font-serif text-xl font-bold text-diamond transition-colors group-hover:text-gold">
                          {dest.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining destinations — 3-col equal bento */}
            {rest.slice(2).length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rest.slice(2).map((dest, i) => {
                  // Every 5th card spanning 2 cols creates visual rhythm
                  const isWide = i % 5 === 2
                  const tagline = dest.description || faker.company.catchPhrase()
                  return (
                    <Link
                      key={dest._id}
                      href={`/destinations/${dest.slug}`}
                      className={`group relative overflow-hidden rounded-2xl${isWide ? " sm:col-span-2" : ""}`}
                    >
                      <div className="relative h-56 w-full bg-charcoal/10">
                        {dest.heroImage?.src && dest.heroImage.src !== DEFAULT_SRC ? (
                          <Image
                            src={dest.heroImage.src}
                            alt={dest.heroImage.alt || dest.name}
                            fill
                            sizes={isWide ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sand/10 to-ocean/10">
                            <MapPin className="h-8 w-8 text-charcoal/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-transparent to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 p-5">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
                          {dest.region}
                        </p>
                        <h3 className="mt-0.5 font-serif text-xl font-bold text-diamond transition-colors group-hover:text-gold">
                          {dest.name}
                        </h3>
                        {isWide && (
                          <p className="mt-1 line-clamp-1 text-xs text-diamond/65">{tagline}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── CTA strip ────────────────────────────────────────────── */}
      <section className="border-t border-charcoal/10 bg-charcoal py-16 text-center">
        <div className="badge badge-outline mb-4 border-gold/40 uppercase tracking-[0.3em] text-gold">
          Bespoke Travel
        </div>
        <h2 className="font-serif text-3xl font-bold text-diamond">
          Can&apos;t find your dream destination?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-diamond/60">
          Our concierge team crafts fully custom itineraries to anywhere in the world.
        </p>
        <Link href="/concierge" className="btn btn-outline btn-primary mt-8">
          Talk to a Concierge
        </Link>
      </section>
    </main>
  )
}

