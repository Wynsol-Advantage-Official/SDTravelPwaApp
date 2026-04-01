import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAccommodationById } from "@/lib/wix/tours"
import type { Accommodation } from "@/types/tour"
import { faker } from '@/lib/demo/faker'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const acc = await getAccommodationById(id)
  if (!acc) return { title: "Accommodation" }
  return { title: acc.name || "Accommodation" }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const acc: Accommodation | null = await getAccommodationById(id)
  if (!acc) return notFound()

  // demo filler using faker for missing fields
  const demo = {
    tagline: faker.company.catchPhrase(),
    highlights: Array.from({ length: 3 }).map(() => faker.hacker.phrase()),
    contact: faker.phone.number('+1-###-###-####'),
    host: faker.person.fullName(),
    policies: faker.lorem.sentences(2),
  }

  const hero = acc.image?.src && acc.image.src !== "/og/default.jpg" ? acc.image : acc.gallery?.[0] ?? null

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6">
        <Link href={`/tours`} className="text-sm text-ocean hover:underline">
          ← Back to tours
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/20 bg-white shadow-lg">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
          {/* Left: Large hero + details */}
          <div className="col-span-1 md:col-span-2">
            <div className="relative h-96 w-full bg-tan/10">
              {hero ? (
                <Image src={hero.src} alt={hero.alt || acc.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-ocean-deep/50">No image available</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h1 className="mb-2 font-sans text-3xl font-bold text-ocean-deep">{acc.name}</h1>
              <p className="mb-3 text-sm text-ocean-deep/60">{acc.location ?? demo.tagline}</p>

              <div className="mb-4 flex items-center gap-4">
                {acc.rating > 0 && (
                  <div className="text-sm font-medium text-ocean-deep">
                    Rating: <span className="font-semibold">{acc.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="text-sm text-ocean-deep">Host: <span className="font-semibold">{demo.host}</span></div>
                {acc.pricePerNight > 0 && (
                  <div className="text-sm text-ocean-deep">Price from <span className="font-semibold">{acc.currency} {acc.pricePerNight}</span>/night</div>
                )}
              </div>

              {acc.description ? (
                <div className="prose prose-sm mb-4 max-w-none text-ocean-deep/80" dangerouslySetInnerHTML={{ __html: acc.description }} />
              ) : (
                <p className="mb-4 text-ocean-deep/75">{demo.policies}</p>
              )}

              <div className="mt-4 flex gap-3">
                <a href={`tel:${demo.contact}`} className="inline-flex items-center gap-2 rounded-md bg-ocean/10 px-4 py-2 text-sm font-semibold text-ocean">Call Host</a>
                <a href={`mailto:info@example.com`} className="inline-flex items-center gap-2 rounded-md border border-ocean/10 px-4 py-2 text-sm font-semibold text-ocean-deep">Message</a>
              </div>
            </div>
          </div>

          {/* Right: Bento tiles */}
          <aside className="col-span-1 border-l border-white/5 bg-white p-4">
            <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-4 shadow-sm">
              <h4 className="mb-1 text-xs font-semibold uppercase text-ocean">Why you'll love it</h4>
              <p className="text-sm text-ocean-deep/75">{demo.tagline}</p>
            </div>

            <div className="grid grid-rows-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <h5 className="mb-1 text-xs font-semibold text-ocean-deep/90">Highlights</h5>
                <ul className="text-sm text-ocean-deep/70 list-inside list-disc">
                  {demo.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <h5 className="mb-1 text-xs font-semibold text-ocean-deep/90">Policies</h5>
                <p className="text-sm text-ocean-deep/70 line-clamp-3">{demo.policies}</p>
              </div>

              <div className="rounded-lg overflow-hidden">
                {acc.gallery && acc.gallery.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1">
                    <div className="relative h-28 w-full overflow-hidden">
                      <Image src={acc.gallery[0].src} alt={acc.gallery[0].alt || acc.name} fill className="object-cover" />
                    </div>
                    {acc.gallery[1] && (
                      <div className="relative h-20 w-full overflow-hidden">
                        <Image src={acc.gallery[1].src} alt={acc.gallery[1].alt || acc.name} fill className="object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center bg-tan/10">
                    <span className="text-ocean-deep/50">No additional photos</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
