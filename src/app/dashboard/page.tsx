"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/Button"
import { TripCard } from "@/components/dashboard/TripCard"
import Link from "next/link"
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { formatPrice } from "@/lib/utils/format"
import type { Booking } from "@/types/booking"
import {
  mockUser,
  mockBookings,
  mockBookingStats,
  mockSavedDiamonds,
  mockActivity,
} from "@/mocks"
import type { ActivityItem } from "@/mocks/activity"

// ---------------------------------------------------------------------------
// Activity icon mapping
// ---------------------------------------------------------------------------
const ACTIVITY_ICONS: Record<string, string> = {
  booking_created: "◈",
  booking_confirmed: "✓",
  booking_completed: "★",
  diamond_saved: "♦",
  message_received: "◇",
  profile_updated: "●",
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user, signOut } = useAuth()
  const { isMockMode } = useMockMode()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode) {
      setBookings(mockBookings)
      setLoading(false)
      return
    }

    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }

    const ref = collection(db, "bookings")
    const q = query(
      ref,
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10),
    )

    const unsub = onSnapshot(q, (snap) => {
      const items: Booking[] = snap.docs.map((d) => ({
        _id: d.id,
        ...(d.data() as Omit<Booking, "_id">),
      }))
      setBookings(items)
      setLoading(false)
    })

    return unsub
  }, [user, isMockMode])

  const displayName = isMockMode
    ? mockUser.displayName
    : user?.displayName ?? "Traveler"
  const email = isMockMode ? mockUser.email : user?.email

  // Computed stats
  const now = new Date()
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && b.dates && new Date(b.dates.start) > now,
  )
  const pendingCount = bookings.filter((b) => b.status === "pending").length
  const completedCount = bookings.filter((b) => b.status === "completed").length
  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.totalPrice, 0)
  const savedCount = isMockMode ? mockSavedDiamonds.length : 0
  const activity: ActivityItem[] = isMockMode ? mockActivity : []

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">{email}</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-charcoal/50 transition-colors hover:text-charcoal"
        >
          Sign Out
        </button>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming Trips"
          value={String(upcoming.length)}
          icon="◈"
          href="/dashboard/bookings"
        />
        <StatCard
          label="Pending"
          value={String(pendingCount)}
          icon="◇"
          href="/dashboard/bookings"
        />
        <StatCard
          label="Saved Diamonds"
          value={String(savedCount)}
          icon="♦"
          href="/dashboard/saved"
        />
        <StatCard
          label="Total Invested"
          value={formatPrice(totalSpent)}
          icon="★"
        />
      </div>

      {/* ── Upcoming Trips Preview ──────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Upcoming Trips
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs font-medium text-ocean transition-colors hover:text-gold"
          >
            View All
          </Link>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-charcoal/40">
            Loading trips…
          </p>
        ) : upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((booking) => (
              <TripCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-sand/20 bg-white px-6 py-10 text-center">
            <p className="text-charcoal/50">No upcoming trips yet.</p>
            <Button href="/tours" size="sm" className="mt-4">
              Explore Tours
            </Button>
          </div>
        )}
      </section>

      {/* ── Quick Access + Activity Feed ────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Quick Access
          </h2>
          <QuickAccessCard
            href="/dashboard/bookings"
            icon="◈"
            title="My Bookings"
            subtitle={`${bookings.length} total · ${completedCount} completed`}
          />
          <QuickAccessCard
            href="/dashboard/saved"
            icon="♦"
            title="Saved Diamonds"
            subtitle={`${savedCount} tours wishlisted`}
          />
          <QuickAccessCard
            href="/dashboard/chat"
            icon="◇"
            title="Concierge Chat"
            subtitle="Speak directly with an advisor"
          />
          <QuickAccessCard
            href="/dashboard/profile"
            icon="●"
            title="Profile & Settings"
            subtitle="Manage your account details"
          />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal">
            Recent Activity
          </h2>
          {activity.length > 0 ? (
            <div className="divide-y divide-sand/10 rounded-sm border border-sand/20 bg-white">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.link ?? "/dashboard"}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-diamond/40"
                >
                  <span className="mt-0.5 text-base text-gold">
                    {ACTIVITY_ICONS[item.type] ?? "·"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-charcoal">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-charcoal/50">
                      {item.description}
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] text-charcoal/30">
                    {new Date(item.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-sand/20 bg-white px-6 py-10 text-center">
              <p className="text-sm text-charcoal/40">
                {isMockMode
                  ? "No activity to display."
                  : "Activity will appear here once you start using your account."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string
  value: string
  icon: string
  href?: string
}) {
  const inner = (
    <div className="rounded-sm border border-sand/20 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xl text-gold">{icon}</span>
      </div>
      <p className="mt-3 font-serif text-2xl font-bold text-charcoal">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-charcoal/50">{label}</p>
    </div>
  )

  if (href) {
    return <Link href={href}>{inner}</Link>
  }
  return inner
}

function QuickAccessCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string
  icon: string
  title: string
  subtitle: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-sm border border-sand/20 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <span className="text-xl text-gold">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-charcoal group-hover:text-ocean">
          {title}
        </p>
        <p className="text-xs text-charcoal/50">{subtitle}</p>
      </div>
    </Link>
  )
}
