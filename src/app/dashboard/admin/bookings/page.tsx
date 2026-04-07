"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/Card"
import { formatPrice } from "@/lib/utils/format"
import { Search, RefreshCw, Loader2, ChevronDown } from "lucide-react"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<BookingStatus, string> = {
  hold: "bg-amber-100 text-amber-800",
  pending: "bg-tan-50 text-tan-600",
  awaiting_payment: "bg-purple-100 text-purple-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-ocean-50 text-ocean",
  cancelled: "bg-red-100 text-red-700",
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  hold: "Hold",
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

const VALID_TRANSITIONS: Record<string, { label: string; to: BookingStatus }[]> = {
  hold: [
    { label: "Confirm", to: "confirmed" },
    { label: "Awaiting Payment", to: "awaiting_payment" },
    { label: "Cancel", to: "cancelled" },
  ],
  pending: [
    { label: "Confirm", to: "confirmed" },
    { label: "Awaiting Payment", to: "awaiting_payment" },
    { label: "Cancel", to: "cancelled" },
  ],
  awaiting_payment: [
    { label: "Confirm Payment", to: "confirmed" },
    { label: "Cancel", to: "cancelled" },
  ],
  confirmed: [
    { label: "Complete", to: "completed" },
    { label: "Cancel", to: "cancelled" },
  ],
}

const FILTER_TABS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Hold", value: "hold" },
  { label: "Awaiting Payment", value: "awaiting_payment" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminBookingsPage() {
  return (
    <AuthGuard requiredRole="tenant_admin">
      <BookingsManagement />
    </AuthGuard>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function BookingsManagement() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ── Fetch bookings ────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch("/api/bookings/admin-list", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // ── Update status ─────────────────────────────────────────────────────
  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    if (!user) return
    setUpdatingId(bookingId)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch("/api/bookings/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ bookingId, newStatus }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || `HTTP ${res.status}`)
      }
      // Optimistically update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b)),
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : "Status update failed")
    } finally {
      setUpdatingId(null)
    }
  }

  // ── Client-side filtering ─────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.tourTitle?.toLowerCase().includes(q) ||
      b.userName?.toLowerCase().includes(q) ||
      b.userEmail?.toLowerCase().includes(q) ||
      b._id.toLowerCase().includes(q) ||
      (b.tourId as string | undefined)?.toLowerCase().includes(q) ||
      (b.uid as string | undefined)?.toLowerCase().includes(q) ||
      (b.tenantId as string | undefined)?.toLowerCase().includes(q)
    )
  })

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ocean-deep dark:text-tan-100">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
            {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-ocean-deep/10 px-3 py-2 text-sm font-medium text-ocean-deep/70 hover:bg-ocean-deep/5 dark:border-tan-100/10 dark:text-tan-100/70 dark:hover:bg-tan-100/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter strip + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-ocean text-white"
                  : "bg-ocean-deep/5 text-ocean-deep/60 hover:bg-ocean-deep/10 dark:bg-tan-100/5 dark:text-tan-100/60 dark:hover:bg-tan-100/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-deep/30 dark:text-tan-100/30" />
          <input
            type="text"
            placeholder="Search bookings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-ocean-deep/10 bg-white py-2 pl-9 pr-3 text-sm text-ocean-deep placeholder:text-ocean-deep/30 dark:border-tan-100/10 dark:bg-ocean-deep/50 dark:text-tan-100 dark:placeholder:text-tan-100/30 sm:w-64"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Loading state */}
      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-ocean-deep/30 dark:text-tan-100/30" />
            <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50">Loading bookings…</p>
          </div>
        </Card>
      ) : error ? null : filtered.length === 0 ? (
        /* Empty state */
        <Card className="p-12">
          <div className="text-center">
            <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50">
              {bookings.length === 0
                ? "No bookings yet."
                : "No bookings match the current filters."}
            </p>
          </div>
        </Card>
      ) : (
        /* Bookings table */
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ocean-deep/10 dark:border-tan-100/10">
                  <th className="px-4 py-3 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    Tour
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    Tour ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    UID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    Tenant
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-ocean-deep/60 dark:text-tan-100/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <BookingRow
                    key={b._id}
                    booking={b}
                    updating={updatingId === b._id}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function BookingRow({
  booking,
  updating,
  onStatusUpdate,
}: {
  booking: EnrichedBooking
  updating: boolean
  onStatusUpdate: (id: string, status: BookingStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const actions = VALID_TRANSITIONS[booking.status] ?? []
  const createdAt = booking.createdAt
    ? new Date(booking.createdAt as unknown as string).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—"

  return (
    <tr className="border-b border-ocean-deep/5 dark:border-tan-100/5 hover:bg-ocean-deep/[0.02] dark:hover:bg-tan-100/[0.02]">
      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {booking.userAvatar ? (
            <img
              src={booking.userAvatar}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-deep/10 text-xs font-medium text-ocean-deep/60 dark:bg-tan-100/10 dark:text-tan-100/60">
              {(booking.userName?.[0] ?? booking.userEmail?.[0] ?? "?").toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-ocean-deep dark:text-tan-100">
              {booking.userName || "—"}
            </p>
            <p className="truncate text-xs text-ocean-deep/50 dark:text-tan-100/50">
              {booking.userEmail || "—"}
            </p>
          </div>
        </div>
      </td>

      {/* Tour */}
      <td className="px-4 py-3">
        <p className="max-w-[200px] truncate font-medium text-ocean-deep dark:text-tan-100">
          {booking.tourTitle || "—"}
        </p>
      </td>

      {/* Tour ID */}
      <td className="px-4 py-3">
        <p className="max-w-[120px] truncate font-mono text-xs text-ocean-deep/50 dark:text-tan-100/50" title={booking.tourId as string | undefined}>
          {(booking.tourId as string) || "—"}
        </p>
      </td>

      {/* UID */}
      <td className="px-4 py-3">
        <p className="max-w-[120px] truncate font-mono text-xs text-ocean-deep/50 dark:text-tan-100/50" title={booking.uid as string | undefined}>
          {(booking.uid as string) || "—"}
        </p>
      </td>

      {/* Tenant */}
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-ocean-deep/10 px-2 py-0.5 font-mono text-xs text-ocean-deep/70 dark:bg-tan-100/10 dark:text-tan-100/70">
          {(booking.tenantId as string) || "www"}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_BADGE[booking.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </td>

      {/* Created */}
      <td className="px-4 py-3 text-ocean-deep/60 dark:text-tan-100/60">
        {createdAt}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right font-medium text-ocean-deep dark:text-tan-100">
        {formatPrice(booking.totalPrice ?? 0, booking.currency ?? "USD")}
      </td>

      {/* Actions dropdown */}
      <td className="px-4 py-3 text-right">
        {actions.length > 0 && (
          <div className="relative inline-block">
            <button
              onClick={() => setOpen((v) => !v)}
              disabled={updating}
              className="inline-flex items-center gap-1 rounded-lg border border-ocean-deep/10 px-2.5 py-1.5 text-xs font-medium text-ocean-deep/70 hover:bg-ocean-deep/5 disabled:opacity-50 dark:border-tan-100/10 dark:text-tan-100/70 dark:hover:bg-tan-100/5"
            >
              {updating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  Update
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
            {open && !updating && (
              <>
                {/* Backdrop to close dropdown */}
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 min-w-[150px] rounded-lg border border-ocean-deep/10 bg-white py-1 shadow-lg dark:border-tan-100/10 dark:bg-ocean-deep">
                  {actions.map((a) => (
                    <button
                      key={a.to}
                      onClick={() => {
                        setOpen(false)
                        onStatusUpdate(booking._id, a.to)
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs font-medium hover:bg-ocean-deep/5 dark:hover:bg-tan-100/5 ${
                        a.to === "cancelled"
                          ? "text-red-600"
                          : "text-ocean-deep dark:text-tan-100"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}
