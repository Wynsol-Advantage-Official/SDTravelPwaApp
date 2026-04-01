import Image from "next/image"
import Link from "next/link"
import { getDestinations } from "@/lib/wix/tours"

export async function DestinationsPreview() {
  const destinations = await getDestinations()
  const preview = destinations.slice(0, 4)

  if (preview.length === 0) return null

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-ocean">
          Explore the World
        </p>
        <h2 className="text-center font-sans text-3xl font-bold text-ocean-deep sm:text-4xl">
          Destination Gems
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-ocean-deep/60">
          Discover extraordinary places, hand-selected by our concierge team.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-lg"
            >
              <Image
                src={dest.heroImage.src}
                alt={dest.heroImage.alt || dest.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/70 via-transparent to-transparent" />
              <div className="relative z-10 p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-ocean">
                  {dest.region}
                </p>
                <h3 className="mt-1 font-sans text-xl font-bold text-white">
                  {dest.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/destinations"
            className="inline-flex h-12 items-center rounded-sm border border-ocean-deep/20 px-8 text-sm font-semibold uppercase tracking-wider text-ocean-deep transition-colors hover:border-blue-chill hover:text-blue-chill"
          >
            View All Destinations
          </Link>
        </div>
      </div>
    </section>
  )
}
