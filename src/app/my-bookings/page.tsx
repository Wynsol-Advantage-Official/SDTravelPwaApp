"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { db, auth } from "@/lib/firebase/client"
import { onAuthStateChanged, type User } from "firebase/auth"
import { formatPrice } from "@/lib/utils/format"
import type { Booking, BookingStatus } from "@/types/booking"
import {
  CalendarDays,
  MapPin,
  Sparkles,
  Compass,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  CreditCard,
  Diamond,
  Plane,
  ArrowRight,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Status Configuration
// ---------------------------------------------------------------------------

interface StatusConfig {
  label: string
  icon: React.ReactNode
  glow: string
  badge: string
  text: string
}

const STATUS_MAP: Record<BookingStatus, StatusConfig> = {
  hold: {
    label: "Concierge Review",
    icon: <Diamond className="h-4 w-4" />,
    glow: "shadow-[0_0_20px_rgba(212,175,55,0.3)]",
    badge: "bg-gold/20 border-gold/30",
    text: "text-gold-300",
  },
  pending: {
    label: "Pending",
    icon: <Hourglass className="h-4 w-4" />,
    glow: "shadow-[0_0_20px_rgba(212,175,55,0.25)]",
    badge: "bg-amber-500/20 border-amber-400/30",
    text: "text-amber-300",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    icon: <CreditCard className="h-4 w-4" />,
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    badge: "bg-purple-500/20 border-purple-400/30",
    text: "text-purple-300",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    badge: "bg-emerald-500/20 border-emerald-400/30",
    text: "text-emerald-300",
  },
  completed: {
    label: "Completed",
    icon: <Sparkles className="h-4 w-4" />,
    glow: "shadow-[0_0_20px_rgba(0,105,148,0.3)]",
    badge: "bg-ocean/20 border-ocean/30",
    text: "text-ocean-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-4 w-4" />,
    glow: "",
    badge: "bg-red-500/15 border-red-400/20",
    text: "text-red-400",
  },
}

// ---------------------------------------------------------------------------
// Card animation variants (stagger children)
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MyBookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Auth guard ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser)
      setAuthChecked(true)
      if (!fbUser) router.replace("/auth/sign-in")
    })
    return unsub
  }, [router])

  // ── Real-time bookings listener ───────────────────────────────────────
  useEffect(() => {
    if (!user) return

    const ref = collection(db, "bookings")
    const q = query(ref, where("uid", "==", user.uid), orderBy("createdAt", "desc"))

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Booking[] = snap.docs.map((d) => ({
          _id: d.id,
          ...(d.data() as Omit<Booking, "_id">),
        }))
        setBookings(items)
        setLoading(false)
      },
      (err) => {
        console.error("[MyBookings] Listener error:", err)
        setLoading(false)
      },
    )

    return unsub
  }, [user])

  // ── Loading / auth redirect state ─────────────────────────────────────
  if (!authChecked || (!user && !authChecked)) {
    return <FullPageLoader />
  }

  if (!user) return null // Will redirect via useEffect

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal">
      {/* ── Ambient background ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-150 w-150 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-125 w-125 rounded-full bg-ocean/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-100 w-100 -translate-x-1/2 rounded-full bg-purple-900/5 blur-3xl" />
      </div>

      <div ref={scrollRef} className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        {/* ── Glass Header ────────────────────────────────────────────── */}
        <GlassHeader user={user} bookingCount={bookings.length} />

        {/* ── Content ─────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSkeleton />
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {bookings.map((booking) => (
                <motion.div key={booking._id} variants={cardVariants} layout>
                  <BookingCard booking={booking} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Glass Header
// ---------------------------------------------------------------------------

function GlassHeader({ user, bookingCount }: { user: User; bookingCount: number }) {
  const firstName = user.displayName?.split(" ")[0] ?? "Traveler"

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md sm:p-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-gold/80">
            Your Journeys
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {bookingCount === 0
              ? "Your next adventure awaits"
              : `${bookingCount} experience${bookingCount !== 1 ? "s" : ""} curated for you`}
          </p>
        </div>

        {/* Decorative diamond */}
        <div className="hidden shrink-0 sm:block">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 backdrop-blur-sm">
            <Compass className="h-8 w-8 text-gold" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Booking Card — Glassmorphism
// ---------------------------------------------------------------------------

function BookingCard({ booking }: { booking: Booking }) {
  const status = STATUS_MAP[booking.status] ?? STATUS_MAP.pending
  const isConcierge = booking.status === "hold" || booking.status === "pending"
  const dateDisplay = formatBookingDate(booking)
  const tourLink = `/tours/${booking.tourSlug ?? booking.tourId ?? ""}`

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-md transition-all duration-500",
        "hover:border-white/20 hover:bg-white/10",
        status.glow,
      ].join(" ")}
    >
      {/* ── Image area ──────────────────────────────────────────────── */}
      <div className="relative aspect-16/10 overflow-hidden">
        <Image
          src="/images/tour-placeholder.jpg"
          alt={booking.tourTitle}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-charcoal via-charcoal/40 to-transparent" />

        {/* Status badge — floats over image */}
        <div className="absolute right-3 top-3">
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-sm ${status.badge}`}
          >
            <span className={status.text}>{status.icon}</span>
            <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
          </div>
        </div>

        {/* Data source chip */}
        {booking.dataSource && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-charcoal/60 px-2 py-0.5 text-[10px] font-medium tracking-wider text-white/60 backdrop-blur-sm">
              {booking.dataSource}
            </span>
          </div>
        )}

        {/* Title over image bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <Link
            href={tourLink}
            className="font-serif text-xl font-bold leading-snug text-white transition-colors hover:text-gold"
          >
            {booking.tourTitle}
          </Link>
        </div>
      </div>

      {/* ── Metadata area ───────────────────────────────────────────── */}
      <div className="space-y-4 p-5">
        {/* Date + Price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span className="text-sm">{dateDisplay}</span>
          </div>
          <div className="font-serif text-lg font-bold text-white">
            {formatPrice(booking.totalPrice, booking.currency)}
          </div>
        </div>

        {/* Guests & location row */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {booking.guests != null && booking.guests > 0 && (
            <span className="flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5" />
              {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
            </span>
          )}
          {booking.tourSlug && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="max-w-28 truncate capitalize">
                {booking.tourSlug.replace(/-/g, " ")}
              </span>
            </span>
          )}
        </div>

        {/* ── Concierge Message ──────────────────────────────────────── */}
        {isConcierge && (
          <div className="rounded-xl border border-gold/15 bg-gold/5 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <Diamond className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gold/90">
                  Concierge Message
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Our concierge is curating your itinerary. You&apos;ll receive a
                  personalised confirmation within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── View details link ─────────────────────────────────────── */}
        <Link
          href={`/my-bookings/${booking._id}`}
          className="group/link flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold/70 transition-colors hover:text-gold"
        >
          View Booking Details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-20 flex flex-col items-center text-center"
    >
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
        <Compass className="h-12 w-12 text-gold/60" />
      </div>
      <h2 className="font-serif text-3xl font-bold text-white">
        Start Your Journey
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        Discover our handpicked collection of extraordinary travel experiences — crafted 
        by your dedicated Diamond concierge.
      </p>
      <Link
        href="/tours"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-gold transition-all hover:border-gold/50 hover:bg-gold/20 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
      >
        <Sparkles className="h-4 w-4" />
        Explore Tours
      </Link>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Loading States
// ---------------------------------------------------------------------------

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        <p className="text-sm text-slate-500">Loading your experiences…</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-white/5 bg-white/3"
        >
          <div className="aspect-16/10 animate-pulse bg-white/5" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBookingDate(booking: Booking): string {
  if (booking.tourDate) return booking.tourDate

  if (booking.dates) {
    try {
      const start = new Date(booking.dates.start)
      return start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Date TBD"
    }
  }

  return "Date TBD"
}
