"use client"

import { useEffect, useState } from "react"
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
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Shield,
  Copy,
} from "lucide-react"
import type { Tour, ItineraryDay, WixImage, Destination, Accommodation } from "@/types/tour"
import { formatPrice } from "@/lib/utils/format"
import { ItineraryTimeline } from "@/components/tours/ItineraryTimeline"

// ---------------------------------------------------------------------------
// Mock Data — guides, testimonials
// ---------------------------------------------------------------------------

interface Guide {
  name: string
  role: string
  avatar: string
  bio: string
}

interface Testimonial {
  name: string
  avatar: string
  rating: number
  date: string
  text: string
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

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    name: "Victoria & James",
    avatar: "https://images.unsplash.com/photo-1523464862212-d6631d073571?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    date: "February 2026",
    text: "Absolutely extraordinary. Every detail was curated to perfection — from the private game drives at sunrise to the candlelit bushveld dinner. Sand Diamonds understands luxury at a level we've never experienced.",
  },
  {
    name: "Dr. Michael Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    date: "January 2026",
    text: "A transformative journey. The team went above and beyond to create meaningful connections with local communities. This isn't just travel — it's a life-changing experience.",
  },
  {
    name: "Amelia Worthington",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    date: "December 2025",
    text: "I've traveled with many luxury operators, but Sand Diamonds is in a league of their own. The attention to detail, the seamless logistics, the personal touches — simply incomparable.",
  },
]

// ---------------------------------------------------------------------------
// TourDetails — rich client component
// ---------------------------------------------------------------------------

interface TourDetailsProps {
  tour: Tour
  itinerary: ItineraryDay[]
  destination?: Destination | null
  accommodations?: Accommodation[]
}

export function TourDetails({ tour, itinerary, destination, accommodations = [] }: TourDetailsProps) {
  const [liked, setLiked] = useState(false)
  const [shareTooltip, setShareTooltip] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [savedAccom, setSavedAccom] = useState<Set<string>>(new Set())
  const [remoteAccImages, setRemoteAccImages] = useState<Record<string, { src: string; alt?: string }>>({})

  useEffect(() => {
    if (!accommodations || accommodations.length === 0) return
    const DEFAULT_SRC = "/og/default.jpg"

    const missing = accommodations.filter((acc) => {
      const hasLocal =
        (acc.image?.src && acc.image.src !== DEFAULT_SRC) ||
        (acc.gallery && acc.gallery.length > 0 && acc.gallery[0].src && acc.gallery[0].src !== DEFAULT_SRC)
      return !hasLocal && acc._id && !remoteAccImages[acc._id]
    })

    if (missing.length === 0) return

    missing.forEach((acc) => {
      ;(async () => {
        try {
          const res = await fetch(`/api/wix/debug/accommodations?id=${acc._id}`)
          if (!res.ok) return
          const body = await res.json()
          const found = body?.accommodation ?? body
          if (found?.image?.src) {
            setRemoteAccImages((prev) => ({
              ...prev,
              [acc._id]: { src: found.image.src, alt: found.image.alt },
            }))
          }
        } catch (e) {
          // silent
        }
      })()
    })
  }, [accommodations, remoteAccImages])

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

  const nextTestimonial = () => {
    setCarouselIndex((i) => (i + 1) % MOCK_TESTIMONIALS.length)
  }
  const prevTestimonial = () => {
    setCarouselIndex((i) => (i - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length)
  }

  return (
    <main className="min-h-dvh bg-diamond" data-theme="sanddiamonds">
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
                    className={`relative hidden min-h-59 overflow-hidden md:block ${roundClass} bg-sand/10`}
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
            <button
              onClick={() => setLiked(!liked)}
              aria-label={liked ? "Remove from saved" : "Save tour"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur-md transition-all hover:bg-white/40"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  liked ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </button>

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
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-charcoal px-2 py-1 text-xs text-diamond"
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
              <Link href="/" className="text-charcoal/60 hover:text-ocean transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/tours" className="text-charcoal/60 hover:text-ocean transition-colors">
                Tours
              </Link>
            </li>
            <li className="font-medium text-charcoal">{tour.title}</li>
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
            <div className="flex items-center gap-2 text-sm text-charcoal/60">
              <MapPin className="h-4 w-4 text-ocean" />
              {tour.destination?.name && (
                <span>
                  {tour.destination.name}
                  {tour.destination.region && ` · ${tour.destination.region}`}
                </span>
              )}
            </div>

            <h1 className="mt-2 font-serif text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
              {tour.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-charcoal/80 sm:text-lg">
              {tour.summary}
            </p>

            {/* Quick stats badges */}
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="badge badge-lg gap-1.5 border-sand/40 bg-sand/10 text-charcoal">
                <Clock className="h-3.5 w-3.5" />
                {tour.duration} Days
              </div>
              <div className="badge badge-lg gap-1.5 border-ocean/30 bg-ocean/10 text-ocean">
                <Users className="h-3.5 w-3.5" />
                Small Group
              </div>
              <div className="badge badge-lg gap-1.5 border-gold/40 bg-gold/10 text-charcoal">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                5.0 Rated
              </div>
            </div>
          </motion.div>

          <div className="divider my-8" />

          {/* Travel Advisory */}
          <div className="alert alert-info mb-8 border border-ocean/20 bg-ocean/5">
            <Info className="h-5 w-5 shrink-0 text-ocean" />
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Travel Advisory</h3>
              <p className="text-sm text-charcoal/70">
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
              className="prose prose-lg max-w-none text-charcoal/80
                prose-headings:font-serif prose-headings:text-charcoal
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
              <h2 className="mb-6 font-serif text-2xl font-bold text-charcoal">
                Tour Highlights
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/5 p-4"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="text-sm leading-relaxed text-charcoal/85">{h}</span>
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
              <h2 className="mb-6 font-serif text-2xl font-bold text-charcoal">
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
          <ItineraryTimeline days={itinerary} accommodations={accommodations} destination={destination} />

          {/* ── Meet Your Team — daisyUI avatars ────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <h2 className="mb-6 font-serif text-2xl font-bold text-charcoal">
              Meet Your Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {MOCK_GUIDES.map((guide) => (
                <div
                  key={guide.name}
                  className="rounded-xl border border-sand/30 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="avatar mx-auto mb-3">
                    <div className="w-20 rounded-full ring ring-gold/40 ring-offset-2 ring-offset-diamond">
                      <Image
                        src={guide.avatar}
                        alt={guide.name}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-charcoal">
                    {guide.name}
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-gold">
                    {guide.role}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
                    {guide.bio}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── Testimonials — daisyUI carousel ─────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 mb-12"
          >
            <h2 className="mb-6 font-serif text-2xl font-bold text-charcoal">
              Guest Reviews
            </h2>
            <div className="relative overflow-hidden rounded-2xl border border-sand/30 bg-white p-6 shadow-sm sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                  className="min-h-35"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <Image
                          src={MOCK_TESTIMONIALS[carouselIndex].avatar}
                          alt={MOCK_TESTIMONIALS[carouselIndex].name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">
                        {MOCK_TESTIMONIALS[carouselIndex].name}
                      </p>
                      <p className="text-xs text-charcoal/50">
                        {MOCK_TESTIMONIALS[carouselIndex].date}
                      </p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: MOCK_TESTIMONIALS[carouselIndex].rating }).map(
                        (_, i) => (
                          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                        )
                      )}
                    </div>
                  </div>
                  <p className="text-sm italic leading-relaxed text-charcoal/75">
                    &ldquo;{MOCK_TESTIMONIALS[carouselIndex].text}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {MOCK_TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      aria-label={`Show review ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === carouselIndex
                          ? "w-6 bg-gold"
                          : "w-2 bg-sand/40 hover:bg-sand/60"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevTestimonial}
                    aria-label="Previous review"
                    className="btn btn-circle btn-ghost btn-sm border border-sand/30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    aria-label="Next review"
                    className="btn btn-circle btn-ghost btn-sm border border-sand/30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Accommodation ─────────────────────────────────────── */}
          {accommodations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-12 mb-12"
            >
              <h2 className="mb-2 font-serif text-2xl font-bold text-charcoal">
                Where You&apos;ll Stay
              </h2>
              <p className="mb-6 text-sm text-charcoal/55">
                {accommodations.length} propert{accommodations.length === 1 ? "y" : "ies"} on this tour
              </p>

              {/* Horizontal scroll on mobile, grid on lg */}
              <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-3">
                {accommodations.map((acc) => {
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
                    candidateFromRecord ?? (acc._id ? remoteAccImages[acc._id] ?? null : null)

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
                          <div className="flex h-full items-center justify-center bg-sand/15">
                            <MapPin className="h-8 w-8 text-sand/50" />
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
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-charcoal backdrop-blur-sm">
                            {acc.type}
                          </span>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold leading-snug text-charcoal">{acc.name}</p>
                          {acc.rating > 0 && (
                            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-charcoal">
                              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                              {acc.rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {acc.location && (
                          <p className="text-sm text-charcoal/55">{acc.location}</p>
                        )}

                        <div className="flex items-center gap-2 pt-0.5 text-sm">
                          {acc.pricePerNight > 0 ? (
                            <>
                              <span className="font-semibold text-charcoal">
                                {formatPrice(acc.pricePerNight, acc.currency)}
                              </span>
                              <span className="text-charcoal/50">night</span>
                              <span className="text-charcoal/30">&middot;</span>
                            </>
                          ) : null}
                          <span className="text-charcoal/60">
                            {acc.nights} night{acc.nights !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Amenity pills — max 3 */}
                        {acc.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {acc.amenities.slice(0, 3).map((a) => (
                              <span
                                key={a}
                                className="rounded-full border border-sand/30 bg-sand/10 px-2 py-0.5 text-xs text-charcoal/70"
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
                <span className="font-serif text-3xl font-bold text-charcoal">
                  {formatPrice(tour.startingPrice, tour.currency)}
                </span>
                <span className="text-sm text-charcoal/50">per person</span>
              </div>

              <div className="divider my-3" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-charcoal/70">
                  <Clock className="h-4 w-4 text-ocean" />
                  <span>{tour.duration} days / {tour.duration - 1} nights</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal/70">
                  <MapPin className="h-4 w-4 text-ocean" />
                  <span>{tour.destination?.name ?? "Multiple destinations"}</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal/70">
                  <Users className="h-4 w-4 text-ocean" />
                  <span>Max 12 guests per departure</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal/70">
                  <Calendar className="h-4 w-4 text-ocean" />
                  <span>Next departure: Available on request</span>
                </div>
              </div>

              <div className="divider my-3" />

              {/* Reserve button */}
              <a
                href={`/booking/${tour.slug}`}
                className="btn btn-block border-0 bg-gold text-charcoal font-semibold uppercase tracking-wider hover:bg-gold/90 h-12"
              >
                Reserve This Diamond
              </a>

              {/* Hold button */}
              <button className="btn btn-outline btn-block mt-2 border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-diamond h-12">
                Hold for 48 Hours
              </button>

              {/* Trust indicators */}
              <div className="mt-4 flex items-center gap-2 text-xs text-charcoal/50">
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
                  <p className="text-sm font-semibold text-charcoal">
                    Questions? Chat with us
                  </p>
                  <p className="text-xs text-charcoal/50">
                    Average response time: &lt; 2 hours
                  </p>
                </div>
              </div>
              <button className="btn btn-block border-0 bg-ocean text-diamond hover:bg-ocean/90 h-10 text-sm">
                Message Concierge
              </button>
            </motion.div>

            {/* Referral Link — Locked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-2xl border border-sand/30 bg-white/60 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                  <Lock className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    Share &amp; Earn
                  </p>
                  <p className="text-xs text-charcoal/50">
                    Refer a friend and earn travel credits
                  </p>
                </div>
              </div>

              <div className="tooltip tooltip-bottom w-full" data-tip="Sign in to unlock your personal referral link">
                <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-sand/30 bg-sand/10 px-3">
                  <span className="flex-1 truncate text-xs text-charcoal/30">
                    sanddiamondstravel.com/ref/••••••
                  </span>
                  <Copy className="h-3.5 w-3.5 text-charcoal/20" />
                </div>
              </div>

              <p className="mt-2 text-center text-xs text-charcoal/40">
                Sign in to unlock your referral link
              </p>
            </motion.div>
          </div>
        </aside>
      </div>

      {/* ── Mobile Fixed Bottom Bar ──────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand/20 bg-white/90 p-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            <p className="font-serif text-lg font-bold text-charcoal">
              {formatPrice(tour.startingPrice, tour.currency)}
            </p>
            <p className="text-xs text-charcoal/50">per person · {tour.duration} days</p>
          </div>
          <a
            href={`/booking/${tour.slug}`}
            className="btn border-0 bg-gold text-charcoal font-semibold uppercase tracking-wider hover:bg-gold/90 h-11 px-6"
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
