"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Share2,
  Lock,
  Info,
  Star,
  MessageCircle,
  MapPin,
  Clock,
  Users,
  Calendar,
  Check,
  X,
  Shield,
  Copy,
} from "lucide-react"
import type { Tour, ItineraryDay, WixImage, Destination, Room } from "@/types/tour"
import dynamic from "next/dynamic"
import { formatPrice } from "@/lib/utils/format"
import { SaveDiamondButton } from "@/components/tours/SaveDiamondButton"
import { TestimonialCarousel } from "@/components/tours/TestimonialCarousel"
import type { Testimonial } from "@/components/tours/TestimonialCarousel"

const ItineraryTimeline = dynamic(
  () => import("@/components/tours/ItineraryTimeline").then(m => m.ItineraryTimeline),
  { ssr: false }
)

// ---------------------------------------------------------------------------
// Mock Data — guides
// ---------------------------------------------------------------------------

interface Guide {
  name: string
  role: string
  avatar: string
  bio: string
}

const MOCK_GUIDES: Guide[] = [
  {
    name: "Amara Osei",
    role: "Lead Safari Guide",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face",
    bio: "15 years leading luxury safaris across Southern Africa. Certified wildlife tracker and conservation specialist.",
  },
  {
    name: "Liam Nakamura",
    role: "Cultural Concierge",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    bio: "Expert in local heritage and immersive cultural experiences. Fluent in 4 languages.",
  },
  {
    name: "Sofia Delacroix",
    role: "Wellness Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    bio: "Certified holistic therapist specializing in luxury wellness retreats and mindful travel experiences.",
  },
]

// ---------------------------------------------------------------------------
// TourDetails — rich client component
// ---------------------------------------------------------------------------

interface TourDetailsProps {
  tour: Tour
  itinerary: ItineraryDay[]
  destination?: Destination | null
  rooms?: Room[]
  remoteRoomImages?: Record<string, { src: string; alt?: string }>
  /** Testimonials fetched from Wix CMS filtered by this tour's _id */
  testimonials?: Testimonial[]
}

export function TourDetails({ tour, itinerary, destination, rooms = [], remoteRoomImages = {}, testimonials }: TourDetailsProps) {
  const [shareTooltip, setShareTooltip] = useState(false)
  const [savedAccom, setSavedAccom] = useState<Set<string>>(new Set())

  const galleryImages = tour.gallery.length > 0 ? tour.gallery : [tour.heroImage]
  const mainImage = galleryImages[0]
  const sideImages = galleryImages.slice(1, 4)

  // Build a pool of filler images from the destination hero + itinerary day
  // images to replace placeholder cells when the tour gallery is sparse.
  // gather images from related destinations referenced by itinerary days
  const relatedDestinationImgs: WixImage[] = itinerary
    .flatMap((d) => d.destinations || [])
    .flatMap((dest) => {
      const imgs: WixImage[] = []
      if (dest?.heroImage && dest.heroImage.src && dest.heroImage.src !== "/og/default.jpg") {
        imgs.push({ ...dest.heroImage, alt: dest.heroImage.alt || dest.name })
      }
      if (Array.isArray(dest?.gallery) && dest.gallery.length > 0) {
        imgs.push(...dest.gallery.filter((g) => g?.src && g.src !== "/og/default.jpg"))
      }
      return imgs
    })

  const basePool: WixImage[] = [
    ...(destination?.heroImage
      ? [{ ...destination.heroImage, alt: destination.heroImage.alt || destination.name }]
      : []),
    ...itinerary.map((d) => d.image).filter((img) => img?.src && img.src !== "/og/default.jpg"),
    ...relatedDestinationImgs,
  ]

  // unique pool (by src) and exclude images already in gallery
  const seen = new Set<string>()
  const fillerPool: WixImage[] = basePool
    .filter((img) => img && img.src)
    .filter((img) => {
      if (galleryImages.some((g) => g.src === img.src)) return false
      if (seen.has(img.src)) return false
      seen.add(img.src)
      return true
    })

  // Shuffle fillerPool so placeholders pick random images each render
  for (let i = fillerPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = fillerPool[i]
    fillerPool[i] = fillerPool[j]
    fillerPool[j] = tmp
  }

  const handleShare = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/tours/${tour.slug}`
    if (navigator.share) {
      await navigator.share({ title: tour.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setShareTooltip(true)
      setTimeout(() => setShareTooltip(false), 2000)
    }
  }

  return (
    <main className="min-h-dvh bg-white" data-theme="sanddiamonds">
      {/* ── Hero Gallery ─────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          {/* Masonry Grid: 1 large + up to 3 smaller */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2">
            {/* Main image — spans 2 cols × 2 rows */}
            <div className="relative col-span-1 row-span-2 min-h-75 overflow-hidden rounded-l-2xl md:col-span-2 md:min-h-120">
              <Image
                src={mainImage.src}
                alt={mainImage.alt || tour.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Side images — tour gallery, padded with destination/itinerary fillers */}
            {Array.from({ length: 3 }).map((_, i) => {
              const img = sideImages[i] ?? fillerPool[i - sideImages.length]
              const roundClass =
                i === 0 ? "rounded-tr-2xl" : i === 2 ? "rounded-br-2xl" : ""
              if (!img) {
                // truly no image available — transparent spacer
                return (
                  <div
                    key={`filler-${i}`}
                    className={`relative hidden min-h-59 overflow-hidden md:block ${roundClass} bg-tan/10`}
                  />
                )
              }
              return (
                <div
                  key={img.src + i}
                  className={`relative hidden min-h-59 overflow-hidden md:block ${roundClass}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `${tour.title} — ${destination?.name ?? ""}`.trim()}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              )
            })}
          </div>

          {/* Like / Share floating buttons */}
          <div className="absolute right-6 top-8 z-20 flex gap-2 sm:right-10">
            <SaveDiamondButton
              tourId={tour._id}
              tourSlug={tour.slug}
              tourTitle={tour.title}
              heroImageSrc={tour.heroImage.src}
            />

            <div className="relative">
              <button
                onClick={handleShare}
                aria-label="Share tour"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur-md transition-all hover:bg-white/40"
              >
                <Share2 className="h-5 w-5 text-white" />
              </button>
              <AnimatePresence>
                {shareTooltip && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ocean-deep px-2 py-1 text-xs text-white"
                  >
                    Link copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/" className="text-ocean-deep/60 hover:text-ocean transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/tours" className="text-ocean-deep/60 hover:text-ocean transition-colors">
                Tours
              </Link>
            </li>
            <li className="font-medium text-ocean-deep">{tour.title}</li>
          </ul>
        </div>
      </nav>

      {/* ── Main Content + Sidebar ───────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:gap-10">
        {/* ── Left Column (65%) ───────────────────────────────────────── */}
        <div className="lg:w-[65%]">
          {/* Title Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          >
            <div className="flex items-center gap-2 text-sm text-ocean-deep/60">
              <MapPin className="h-4 w-4 text-ocean" />
              {tour.destination?.name && (
                <span>
                  {tour.destination.name}
                  {tour.destination.region && ` · ${tour.destination.region}`}
                </span>
              )}
            </div>

            <h1 className="mt-2 font-sans text-3xl font-bold text-ocean-deep sm:text-4xl lg:text-5xl">
              {tour.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-ocean-deep/80 sm:text-lg">
              {tour.summary}
            </p>

            {/* Quick stats badges */}
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="badge badge-lg gap-1.5 border-tan/40 bg-tan/10 text-ocean-deep">
                <Clock className="h-3.5 w-3.5" />
                {tour.duration} Days
              </div>
              <div className="badge badge-lg gap-1.5 border-ocean/30 bg-ocean/10 text-ocean">
                <Users className="h-3.5 w-3.5" />
                Small Group
              </div>
              <div className="badge badge-lg gap-1.5 border-ocean/40 bg-ocean/10 text-ocean-deep">
                <Star className="h-3.5 w-3.5 fill-gold text-ocean" />
                5.0 Rated
              </div>
            </div>
          </motion.div>

          <div className="divider my-8" />

          {/* Travel Advisory */}
          <div className="alert alert-info mb-8 border border-ocean/20 bg-ocean/5">
            <Info className="h-5 w-5 shrink-0 text-ocean" />
            <div>
              <h3 className="text-sm font-semibold text-ocean-deep">Travel Advisory</h3>
              <p className="text-sm text-ocean-deep/70">
                Valid passport required (6 months validity). Visa arrangements and travel
                insurance are handled by your dedicated concierge as part of your package.
              </p>
            </div>
          </div>

          {/* Description */}
          {tour.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="prose prose-lg max-w-none text-ocean-deep/80
                prose-headings:font-sans prose-headings:text-ocean-deep
                prose-a:text-ocean prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: tour.description }}
            />
          )}

          {/* ── Highlights ──────────────────────────────────────────── */}
          {tour.highlights.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <h2 className="mb-6 font-sans text-2xl font-bold text-ocean-deep">
                Tour Highlights
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-start gap-3 rounded-xl border border-ocean/20 bg-ocean/5 p-4"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                    <span className="text-sm leading-relaxed text-ocean-deep/85">{h}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── What's Included / Excluded ──────────────────────────── */}
          {(tour.included || tour.excluded) && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <h2 className="mb-6 font-sans text-2xl font-bold text-ocean-deep">
                What&apos;s Included
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {tour.included && (
                  <div className="rounded-xl border border-green-200 bg-green-50/60 p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-800">
                      <Check className="h-4 w-4" /> Included
                    </h3>
                    <div
                      className="prose prose-sm text-green-900/70 prose-li:marker:text-green-500"
                      dangerouslySetInnerHTML={{ __html: tour.included }}
                    />
                  </div>
                )}
                {tour.excluded && (
                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-800">
                      <X className="h-4 w-4" /> Not Included
                    </h3>
                    <div
                      className="prose prose-sm text-red-900/70 prose-li:marker:text-red-400"
                      dangerouslySetInnerHTML={{ __html: tour.excluded }}
                    />
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* ── Itinerary Timeline (Parent→Child) ──────────────────── */}
          <ItineraryTimeline days={itinerary} rooms={rooms} destination={destination} />

          {/* ── Meet Your Team — daisyUI avatars ────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <h2 className="mb-6 font-sans text-2xl font-bold text-ocean-deep">
              Meet Your Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {MOCK_GUIDES.map((guide) => (
                <div
                  key={guide.name}
                  className="rounded-xl border border-tan/30 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="avatar mx-auto mb-3">
                    <div className="w-20 rounded-full ring ring-ocean/40 ring-offset-2 ring-offset-diamond">
                      <Image
                        src={guide.avatar}
                        alt={guide.name}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <h3 className="font-sans text-base font-semibold text-ocean-deep">
                    {guide.name}
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-ocean">
                    {guide.role}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ocean-deep/60">
                    {guide.bio}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── Testimonials ─────────────────────────────────────────── */}
          <TestimonialCarousel testimonials={testimonials ?? []} />

          {/* ── Room ─────────────────────────────────────── */}
          {rooms.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-12 mb-12"
            >
              <h2 className="mb-2 font-sans text-2xl font-bold text-ocean-deep">
                Where You&apos;ll Stay
              </h2>
              <p className="mb-6 text-sm text-ocean-deep/55">
                {rooms.length} propert{rooms.length === 1 ? "y" : "ies"} on this tour
              </p>

              {/* Horizontal scroll on mobile, grid on lg */}
              <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-3">
                {rooms.map((acc) => {
                  const isSaved = savedAccom.has(acc._id)
                  const DEFAULT_SRC = "/og/default.jpg"
                  // Prefer a real hero image; fall back to the first gallery image
                  const candidateFromRecord =
                    acc.image?.src && acc.image.src !== DEFAULT_SRC
                      ? acc.image
                      : acc.gallery && acc.gallery.length > 0 && acc.gallery[0].src && acc.gallery[0].src !== DEFAULT_SRC
                      ? acc.gallery[0]
                      : null

                  const candidateImage =
                    candidateFromRecord ?? (acc._id ? remoteRoomImages[acc._id] ?? null : null)

                  const hasImage = Boolean(candidateImage && candidateImage.src)

                  return (
                    <div
                      key={acc._id}
                      className="w-72 shrink-0 lg:w-auto"
                    >
                      {/* Image */}
                      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
                        {hasImage ? (
                          <Image
                            src={candidateImage!.src}
                            alt={(candidateImage!.alt || acc.name) as string}
                            fill
                            sizes="(max-width: 1024px) 288px, 33vw"
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-tan/15">
                            <MapPin className="h-8 w-8 text-tan/50" />
                          </div>
                        )}

                        {/* Save button */}
                        <button
                          onClick={() =>
                            setSavedAccom((prev) => {
                              const next = new Set(prev)
                              isSaved ? next.delete(acc._id) : next.add(acc._id)
                              return next
                            })
                          }
                          aria-label={isSaved ? "Remove from saved" : "Save property"}
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/40"
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              isSaved ? "fill-red-500 text-red-500" : "text-white"
                            }`}
                          />
                        </button>

                        {/* Type badge */}
                        {acc.type && (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-ocean-deep backdrop-blur-sm">
                            {acc.type}
                          </span>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold leading-snug text-ocean-deep">{acc.name}</p>
                          {acc.rating > 0 && (
                            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-ocean-deep">
                              <Star className="h-3.5 w-3.5 fill-gold text-ocean" />
                              {acc.rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {acc.location && (
                          <p className="text-sm text-ocean-deep/55">{acc.location}</p>
                        )}

                        <div className="flex items-center gap-2 pt-0.5 text-sm">
                          {acc.pricePerNight > 0 ? (
                            <>
                              <span className="font-semibold text-ocean-deep">
                                {formatPrice(acc.pricePerNight, acc.currency)}
                              </span>
                              <span className="text-ocean-deep/50">night</span>
                              <span className="text-ocean-deep/30">&middot;</span>
                            </>
                          ) : null}
                          <span className="text-ocean-deep/60">
                            {acc.nights} night{acc.nights !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Amenity pills — max 3 */}
                        {acc.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {acc.amenities.slice(0, 3).map((a) => (
                              <span
                                key={a}
                                className="rounded-full border border-tan/30 bg-tan/10 px-2 py-0.5 text-xs text-ocean-deep/70"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.section>
          )}
        </div>

        {/* ── Sticky Sidebar (35%) ──────────────────────────────────── */}
        <aside className="lg:w-[35%]">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Pricing Card — glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-lg"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-3xl font-bold text-ocean-deep">
                  {formatPrice(tour.startingPrice, tour.currency)}
                </span>
                <span className="text-sm text-ocean-deep/50">per person</span>
              </div>

              <div className="divider my-3" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-ocean-deep/70">
                  <Clock className="h-4 w-4 text-ocean" />
                  <span>{tour.duration} days / {tour.duration - 1} nights</span>
                </div>
                <div className="flex items-center gap-2 text-ocean-deep/70">
                  <MapPin className="h-4 w-4 text-ocean" />
                  <span>{tour.destination?.name ?? "Multiple destinations"}</span>
                </div>
                <div className="flex items-center gap-2 text-ocean-deep/70">
                  <Users className="h-4 w-4 text-ocean" />
                  <span>Max 12 guests per departure</span>
                </div>
                <div className="flex items-center gap-2 text-ocean-deep/70">
                  <Calendar className="h-4 w-4 text-ocean" />
                  <span>Next departure: Available on request</span>
                </div>
              </div>

              <div className="divider my-3" />

              {/* Reserve button */}
              <a
                href={`/booking/${tour.slug}`}
                className="btn btn-block border-0 bg-ocean text-ocean-deep font-semibold uppercase tracking-wider hover:bg-ocean/90 h-12"
              >
                Reserve This Diamond
              </a>

              {/* Hold button */}
              <button className="btn btn-outline btn-block mt-2 border-ocean-deep/20 text-ocean-deep hover:bg-ocean-deep hover:text-white h-12">
                Hold for 48 Hours
              </button>

              {/* Trust indicators */}
              <div className="mt-4 flex items-center gap-2 text-xs text-ocean-deep/50">
                <Shield className="h-3.5 w-3.5" />
                <span>Free cancellation up to 30 days before departure</span>
              </div>
            </motion.div>

            {/* Message Concierge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-2xl border border-ocean/20 bg-ocean/5 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean/10">
                  <MessageCircle className="h-5 w-5 text-ocean" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ocean-deep">
                    Questions? Chat with us
                  </p>
                  <p className="text-xs text-ocean-deep/50">
                    Average response time: &lt; 2 hours
                  </p>
                </div>
              </div>
              <button className="btn btn-block border-0 bg-ocean text-white hover:bg-ocean/90 h-10 text-sm">
                Message Concierge
              </button>
            </motion.div>

            {/* Referral Link — Locked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-2xl border border-tan/30 bg-white/60 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean/10">
                  <Lock className="h-5 w-5 text-ocean" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ocean-deep">
                    Share &amp; Earn
                  </p>
                  <p className="text-xs text-ocean-deep/50">
                    Refer a friend and earn travel credits
                  </p>
                </div>
              </div>

              <div className="tooltip tooltip-bottom w-full" data-tip="Sign in to unlock your personal referral link">
                <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-tan/30 bg-tan/10 px-3">
                  <span className="flex-1 truncate text-xs text-ocean-deep/30">
                    sanddiamonds.travel/ref/••••••
                  </span>
                  <Copy className="h-3.5 w-3.5 text-ocean-deep/20" />
                </div>
              </div>

              <p className="mt-2 text-center text-xs text-ocean-deep/40">
                Sign in to unlock your referral link
              </p>
            </motion.div>
          </div>
        </aside>
      </div>

      {/* ── Mobile Fixed Bottom Bar ──────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-tan/20 bg-white/90 p-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            <p className="font-sans text-lg font-bold text-ocean-deep">
              {formatPrice(tour.startingPrice, tour.currency)}
            </p>
            <p className="text-xs text-ocean-deep/50">per person · {tour.duration} days</p>
          </div>
          <a
            href={`/booking/${tour.slug}`}
            className="btn border-0 bg-ocean text-ocean-deep font-semibold uppercase tracking-wider hover:bg-ocean/90 h-11 px-6"
          >
            Reserve
          </a>
        </div>
      </div>

      {/* Bottom spacer for mobile fixed bar */}
      <div className="h-20 lg:hidden" />
    </main>
  )
}
