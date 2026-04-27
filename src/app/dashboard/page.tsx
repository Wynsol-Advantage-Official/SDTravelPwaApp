"use client"

import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { useUserBookings } from "@/hooks/useUserBookings"
import { useActivity } from "@/hooks/useActivity"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/Button"
import { TripCard } from "@/components/dashboard/TripCard"
import Link from "next/link"
import { formatPrice } from "@/lib/utils/format"
import {
  mockUser,
  mockBookingStats,
  mockSavedDiamonds,
} from "@/mocks"
import type { ActivityItem } from "@/types/activity"

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
  const { bookings, loading } = useUserBookings(10)
  const { activity, loading: activityLoading } = useActivity(20)

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

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold text-ocean-deep dark:text-white">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-ocean-deep/60 dark:text-white/60">{email}</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-ocean-deep/40 transition-colors hover:text-ocean-deep dark:text-white/40 dark:hover:text-white"
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
          <h2 className="font-sans text-xl font-semibold text-ocean-deep dark:text-white">
            Upcoming Trips
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs font-medium text-ocean transition-colors hover:text-blue-chill dark:text-blue-chill-300 dark:hover:text-blue-chill"
          >
            View All
          </Link>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-ocean-deep/40 dark:text-white/40">
            Loading trips…
          </p>
        ) : upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((booking) => (
              <TripCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-khaki/40 bg-white px-6 py-10 text-center dark:border-white/10 dark:bg-ocean-card">
            <p className="text-ocean-deep/40 dark:text-white/40">No upcoming trips yet.</p>
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
          <h2 className="font-sans text-xl font-semibold text-ocean-deep dark:text-white">
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
          <h2 className="mb-3 font-sans text-xl font-semibold text-ocean-deep dark:text-white">
            Recent Activity
          </h2>
          {activityLoading ? (
            <div className="divide-y divide-khaki/30 rounded-sm border border-khaki/40 bg-white dark:divide-luxborder dark:border-white/10 dark:bg-ocean-card">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4 animate-pulse">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-khaki/40 dark:bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/5 rounded bg-khaki/40 dark:bg-white/10" />
                    <div className="h-3 w-3/4 rounded bg-khaki/30 dark:bg-white/5" />
                  </div>
                  <div className="h-3 w-10 rounded bg-khaki/30 dark:bg-white/5" />
                </div>
              ))}
            </div>
          ) : activity.length > 0 ? (
            <div className="divide-y divide-khaki/30 rounded-sm border border-khaki/40 bg-white dark:divide-luxborder dark:border-white/10 dark:bg-ocean-card">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.link ?? "/dashboard"}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-tan/40 dark:hover:bg-ocean-card2/40"
                >
                  <span className="mt-0.5 text-base text-blue-chill">
                    {ACTIVITY_ICONS[item.type] ?? "·"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ocean-deep dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ocean-deep/40 dark:text-white/40">
                      {item.description}
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] text-ocean-deep/40 dark:text-white/40">
                    {new Date(item.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-khaki/40 bg-white px-6 py-10 text-center dark:border-white/10 dark:bg-ocean-card">
              <p className="text-sm text-ocean-deep/40 dark:text-white/40">
                Activity will appear here once you start using your account.
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
    <div className="rounded-sm border border-khaki/40 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-ocean-card">
      <div className="flex items-center justify-between">
        <span className="text-xl text-blue-chill">{icon}</span>
      </div>
      <p className="mt-3 font-sans text-2xl font-bold text-ocean-deep dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-ocean-deep/40 dark:text-white/40">{label}</p>
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
      className="group flex items-center gap-4 rounded-sm border border-khaki/40 bg-white p-4 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-ocean-card"
    >
      <span className="text-xl text-blue-chill">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-ocean-deep group-hover:text-blue-chill dark:text-white dark:group-hover:text-blue-chill-300">
          {title}
        </p>
        <p className="text-xs text-ocean-deep/40 dark:text-white/40">{subtitle}</p>
      </div>
    </Link>
  )
}
