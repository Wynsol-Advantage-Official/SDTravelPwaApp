"use client"

import { motion } from "framer-motion"
import { MapPin, Utensils, BedDouble, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { ItineraryDay, Room } from "@/types/tour"

// ---------------------------------------------------------------------------
// ItineraryTimeline — daisyUI timeline with glassmorphism child cards
// ---------------------------------------------------------------------------
// Uses the daisyUI `timeline` component for the vertical spine.
// Each child itinerary day is rendered as a glass card (backdrop-blur,
// semi-transparent background, subtle border) that animates into view.
// ---------------------------------------------------------------------------

interface ItineraryTimelineProps {
  days: ItineraryDay[]
  rooms?: Room[]
  /** Tour-level destination used as image fallback when a day has no per-day refs */
  destination?: import("@/types/tour").Destination | null
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

export function ItineraryTimeline({ days, rooms = [], destination }: ItineraryTimelineProps) {
  const DEFAULT_SRC = "/og/default.jpg"

  // Helper: collect valid images from a single Destination record
  function destToImages(d: import("@/types/tour").Destination): import("@/types/tour").WixImage[] {
    return [
      ...(d.heroImage?.src && d.heroImage.src !== DEFAULT_SRC ? [d.heroImage] : []),
      ...(d.gallery ?? []).filter((g) => g.src && g.src !== DEFAULT_SRC),
    ]
  }

  // Fallback pool from the tour-level destination (when a day has no per-day destination refs)
  const fallbackDestImages: import("@/types/tour").WixImage[] = destination
    ? destToImages(destination)
    : []
  // ── Null handling: no child records yet ───────────────────────────────
  if (days.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="mb-6 font-sans text-2xl font-bold text-ocean-deep">
          Your Journey, Day by Day
        </h2>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-lg backdrop-blur-md">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-ocean/60" />
          <p className="font-sans text-lg font-semibold text-ocean-deep/80">
            Itinerary coming soon
          </p>
          <p className="mt-1 text-sm text-ocean-deep/50">
            Our concierge team is crafting your perfect journey. Check back
            shortly for the full day-by-day breakdown.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-12">
      <h2 className="mb-8 font-sans text-2xl font-bold text-ocean-deep">
        Your Journey, Day by Day
      </h2>

      <ul className="timeline timeline-vertical timeline-compact">
        {days.map((day, index) => {
          const isLast = index === days.length - 1
          const hasImage = day.image?.src && day.image.src !== "/og/default.jpg"

          return (
            <li key={day._id || `day-${day.dayNumber}`}>
              {/* Connector line above (skip for first item) */}
              {index !== 0 && <hr className="bg-ocean/30" />}

              {/* ── Day badge (timeline-start) ─────────────────────────── */}
              <div className="timeline-start timeline-box border-0 bg-transparent p-0 text-right">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-ocean bg-white font-sans text-sm font-bold text-ocean-deep shadow-sm">
                  {day.dayNumber}
                </span>
              </div>

              {/* ── Dot (timeline-middle) ──────────────────────────────── */}
              <div className="timeline-middle">
                <div className="h-3 w-3 rounded-full bg-ocean shadow-[0_0_8px_rgba(18,130,165,0.4)]" />
              </div>

              {/* ── Glass card (timeline-end) ──────────────────────────── */}
              <div className="timeline-end mb-8 w-full max-w-xl">
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md"
                >
                  {/* Bento grid: room hero (left) + destination tiles (right) */}
                  {(() => {
                    const accRef = (day.room || "").trim()
                    const matched = rooms.find(
                      (a) => a._id === accRef || a.name === accRef
                    )

                    const DEFAULT_SRC_LOCAL = "/og/default.jpg"
                    const accImg = matched
                      ? matched.image?.src && matched.image.src !== DEFAULT_SRC_LOCAL
                        ? matched.image
                        : matched.gallery && matched.gallery.length > 0 && matched.gallery[0].src !== DEFAULT_SRC_LOCAL
                        ? matched.gallery[0]
                        : null
                      : null

                    const dayDestImages: import("@/types/tour").WixImage[] =
                      day.destinations.length > 0
                        ? day.destinations.flatMap(destToImages)
                        : fallbackDestImages

                    const sideImgs = dayDestImages.filter((d) => d.src !== accImg?.src).slice(0, 3)
                    const hasAcc = Boolean(accImg)
                    const hasSide = sideImgs.length > 0

                    // If only a single banner image exists, keep the large banner behavior
                    if (!hasAcc && !hasSide && hasImage) {
                      return (
                        <div className="relative aspect-16/10 w-full overflow-hidden">
                          <Image
                            src={day.image.src}
                            alt={day.image.alt || day.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 560px"
                            className="object-cover"
                          />
                        </div>
                      )
                    }

                    // Bento: left = room (large), right = stacked destination tiles
                    if (hasAcc) {
                      return (
                        <div className="grid h-48 gap-0.5 md:grid-cols-3">
                          <div className="relative col-span-3 md:col-span-2 overflow-hidden bg-tan/5">
                            {accImg ? (
                              <Image
                                src={accImg.src}
                                alt={accImg.alt || matched!.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 560px"
                                className="object-cover transition-transform duration-500 hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <MapPin className="h-8 w-8 text-tan/40" />
                              </div>
                            )}
                          </div>

                          <div className="col-span-3 md:col-span-1 grid grid-rows-3 gap-0.5">
                            {sideImgs.length === 0 && (
                              // If there are no destination images, show the day's image small
                              <div className="relative h-full w-full overflow-hidden">
                                <Image
                                  src={day.image?.src || DEFAULT_SRC_LOCAL}
                                  alt={day.image?.alt || day.title}
                                  fill
                                  sizes="190px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {sideImgs.map((img, i) => (
                              <div key={img.src + i} className="relative h-full w-full overflow-hidden">
                                <Image
                                  src={img.src}
                                  alt={img.alt || day.title}
                                  fill
                                  sizes="190px"
                                  className="object-cover transition-transform duration-500 hover:scale-105"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    // Fallback: 2-3 column grid using destination images (no matched room)
                    const imgs: import("@/types/tour").WixImage[] = [
                      ...(hasImage ? [day.image] : []),
                      ...dayDestImages.filter((d) => d.src !== day.image?.src),
                    ].slice(0, 3)

                    if (imgs.length === 0) return null

                    if (imgs.length === 1) {
                      return (
                        <div className="relative aspect-16/10 w-full overflow-hidden">
                          <Image
                            src={imgs[0].src}
                            alt={imgs[0].alt || day.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 560px"
                            className="object-cover"
                          />
                        </div>
                      )
                    }

                    return (
                      <div className={imgs.length === 2 ? "grid h-48 grid-cols-2 gap-0.5" : "grid h-48 grid-cols-3 gap-0.5"}>
                        {imgs.map((img, gi) => (
                          <div key={img.src + gi} className="relative h-full w-full overflow-hidden">
                            <Image
                              src={img.src}
                              alt={img.alt || day.title}
                              fill
                              sizes="(max-width: 768px) 50vw, 190px"
                              className="object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="font-sans text-lg font-semibold text-ocean-deep">
                      {day.title}
                    </h3>

                    {day.description && (
                      <p className="mt-2 text-sm leading-relaxed text-ocean-deep/70">
                        {day.description}
                      </p>
                    )}

                    {/* Activities */}
                    {day.activities.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {day.activities.map((activity, i) => (
                          <li
                            key={`${day._id}-act-${i}`}
                            className="flex items-start gap-2 text-sm text-ocean-deep/80"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean" />
                            <span>
                              {activity.time && (
                                <span className="font-medium text-ocean">
                                  {activity.time}{" "}
                                </span>
                              )}
                              {activity.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Meals & Room pills */}
                    {(day.meals || day.room) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {day.meals && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-ocean/20 bg-ocean/5 px-3 py-1 text-xs font-medium text-ocean-deep/75">
                            <Utensils className="h-3 w-3 text-ocean" />
                            {day.meals}
                          </span>
                        )}
                        {day.room && (
                          (() => {
                            const ref = (day.room || "").trim()
                            const matched = rooms.find(
                              (a) => a._id === ref || a.name === ref
                            )

                            if (matched) {
                              const DEFAULT_SRC = "/og/default.jpg"
                              const img =
                                matched.image?.src && matched.image.src !== DEFAULT_SRC
                                  ? matched.image
                                  : matched.gallery?.length > 0 &&
                                    matched.gallery[0].src !== DEFAULT_SRC
                                  ? matched.gallery[0]
                                  : null

                              return (
                                <Link
                                  href={`/rooms/${matched._id}`}
                                  className="group mt-5 block w-full"
                                >
                                  <div className="overflow-hidden rounded-xl border border-ocean/15 bg-white/30 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                                    {/* Label bar */}
                                    <div className="flex items-center gap-1.5 border-b border-ocean/10 px-3 py-1.5">
                                      <BedDouble className="h-3.5 w-3.5 text-ocean" />
                                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean">
                                        Where You&apos;ll Stay
                                      </span>
                                    </div>

                                    {/* Hero image */}
                                    <div className="relative h-36 w-full overflow-hidden bg-tan/10">
                                      {img ? (
                                        <Image
                                          src={img.src}
                                          alt={img.alt || matched.name}
                                          fill
                                          sizes="560px"
                                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                      ) : (
                                        <div className="flex h-full items-center justify-center">
                                          <MapPin className="h-8 w-8 text-tan/40" />
                                        </div>
                                      )}
                                      {/* Rating badge overlay */}
                                      {matched.rating > 0 && (
                                        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-ocean-deep backdrop-blur-sm">
                                          <Star className="h-3 w-3 fill-gold text-ocean" />
                                          {matched.rating.toFixed(1)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Card body */}
                                    <div className="px-3 py-2.5">
                                      <p className="font-sans text-sm font-semibold leading-snug text-ocean-deep">
                                        {matched.name || ref}
                                      </p>
                                      {matched.location && (
                                        <p className="mt-0.5 text-xs text-ocean-deep/55">
                                          {matched.location}
                                        </p>
                                      )}
                                      {matched.description && (
                                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ocean-deep/65">
                                          {matched.description}
                                        </p>
                                      )}
                                      {/* Amenity pills — max 3 */}
                                      {matched.amenities?.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {matched.amenities.slice(0, 3).map((a) => (
                                            <span
                                              key={a}
                                              className="rounded-full border border-tan/30 bg-tan/10 px-2 py-0.5 text-xs text-ocean-deep/60"
                                            >
                                              {a}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {matched.pricePerNight > 0 && (
                                        <p className="mt-2 text-xs text-ocean-deep/50">
                                          From{" "}
                                          <span className="font-semibold text-ocean-deep">
                                            {matched.currency} {matched.pricePerNight}
                                          </span>
                                          /night
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              )
                            }

                            // Fallback: plain pill when no CMS record matched
                            return (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-ocean/20 bg-ocean/5 px-3 py-1 text-xs font-medium text-ocean-deep/75">
                                <BedDouble className="h-3 w-3 text-ocean" />
                                {day.room}
                              </span>
                            )
                          })()
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Connector line below (skip for last item) */}
              {!isLast && <hr className="bg-ocean/30" />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
