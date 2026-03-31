import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTourBySlug, getAllTourSlugs } from "@/lib/wix/tours"
import { BookingForm } from "@/components/booking/BookingForm"
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide"
import { formatPrice } from "@/lib/utils/format"
import Link from "next/link"

interface BookingPageProps {
  params: Promise<{ tourSlug: string }>
}

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const slugs = await getAllTourSlugs()
    return slugs.map((tourSlug) => ({ tourSlug }))
  } catch {
    // Wix unavailable at build time — pages render on first request (ISR)
    return []
  }
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { tourSlug } = await params
  const result = await getTourBySlug(tourSlug)
  if (!result) return { title: "Book a Tour" }

  return {
    title: `Book ${result.tour.title}`,
    description: `Complete your booking for ${result.tour.title} with Sand Diamonds Travel.`,
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { tourSlug } = await params
  const result = await getTourBySlug(tourSlug)

  if (!result) notFound()

  const { tour } = result

  return (
    <main className="min-h-dvh bg-diamond">
      {/* Header bar */}
      <section className="bg-charcoal px-6 pb-10 pt-8">
        <div className="mx-auto max-w-3xl">
          <FadeSlide>
            <FadeSlideChild>
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center gap-2 text-xs text-diamond/60">
                  <li>
                    <Link href="/" className="hover:text-gold transition-colors">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href="/tours" className="hover:text-gold transition-colors">
                      Tours
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="hover:text-gold transition-colors"
                    >
                      {tour.title}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-diamond">Book</li>
                </ol>
              </nav>
            </FadeSlideChild>
            <FadeSlideChild>
              <h1 className="font-serif text-3xl font-bold text-diamond sm:text-4xl">
                Book {tour.title}
              </h1>
            </FadeSlideChild>
            <FadeSlideChild>
              <p className="mt-2 text-sm text-diamond/70">
                From{" "}
                <span className="font-semibold text-gold">
                  {formatPrice(tour.startingPrice, tour.currency)}
                </span>{" "}
                per person · {tour.duration} days
              </p>
            </FadeSlideChild>
          </FadeSlide>
        </div>
      </section>

      {/* Booking form */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <BookingForm
          tourSlug={tour.slug}
          tourTitle={tour.title}
          tourId={tour._id}
          startingPrice={tour.startingPrice}
          currency={tour.currency}
        />
      </section>
    </main>
  )
}
