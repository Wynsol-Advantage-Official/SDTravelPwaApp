"use client"

import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { useSavedDiamonds } from "@/hooks/useSavedDiamonds"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { SaveDiamondButton } from "@/components/tours/SaveDiamondButton"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import Link from "next/link"
import { mockSavedDiamonds } from "@/mocks"
import type { SavedDiamond } from "@/types/user"

export default function SavedDiamondsPage() {
  return (
    <AuthGuard>
      <SavedContent />
    </AuthGuard>
  )
}

function SavedContent() {
  const { user } = useAuth()
  const { isMockMode } = useMockMode()
  const {
    saved: liveSaved,
    loading,
    removeDiamond,
  } = useSavedDiamonds(isMockMode ? null : (user?.uid ?? null))

  const saved: SavedDiamond[] = isMockMode ? mockSavedDiamonds : liveSaved
  const isLoading = !isMockMode && loading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-bold text-ocean-deep dark:text-white">
          Saved Diamonds
        </h1>
        <span className="text-sm text-ocean-deep/50 dark:text-white/40">
          {saved.length} tour{saved.length !== 1 ? "s" : ""} saved
        </span>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
          <p className="text-ocean-deep/50 dark:text-white/40">Loading your saved diamonds…</p>
        </div>
      ) : saved.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-4xl text-ocean/30">♦</div>
          <p className="text-ocean-deep/50 dark:text-white/50">
            You haven&apos;t saved any tours yet.
          </p>
          <p className="mt-1 text-xs text-ocean-deep/40 dark:text-white/35">
            Browse our tours and tap the heart icon to save your favorites.
          </p>
          <Button href="/tours" className="mt-6">
            Explore Tours
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((diamond) => (
            <div
              key={diamond.tourSlug}
              className="group overflow-hidden rounded-xl border border-khaki/30 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-luxborder dark:bg-ocean-card"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={diamond.heroImageSrc || "/og/default.jpg"}
                  alt={diamond.tourTitle}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Heart toggle — already saved, so it will show filled red */}
                <SaveDiamondButton
                  tourId={diamond.tourId}
                  tourSlug={diamond.tourSlug}
                  tourTitle={diamond.tourTitle}
                  heroImageSrc={diamond.heroImageSrc}
                  size="sm"
                  className="absolute right-3 top-3 z-10"
                />
              </div>
              <div className="p-4">
                <Link
                  href={`/tours/${diamond.tourSlug}`}
                  className="font-sans text-lg font-semibold text-ocean-deep transition-colors group-hover:text-ocean dark:text-white dark:group-hover:text-blue-chill-300"
                >
                  {diamond.tourTitle}
                </Link>
                {diamond.notes && (
                  <p className="mt-1 text-xs text-ocean-deep/50 dark:text-white/40">
                    &ldquo;{diamond.notes}&rdquo;
                  </p>
                )}
                {diamond.savedAt && (
                  <p className="mt-2 text-[10px] text-ocean-deep/30 dark:text-white/25">
                    Saved{" "}
                    {formatSavedDate(diamond.savedAt)}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" href={`/booking/${diamond.tourSlug}`}>
                    Book Now
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!isMockMode) removeDiamond(diamond.tourSlug)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Safely format a savedAt value that may be a Date, Firestore Timestamp, or number */
function formatSavedDate(value: unknown): string {
  try {
    // Firestore Timestamp has a toDate() method
    const d =
      value instanceof Date
        ? value
        : typeof value === "object" && value !== null && "toDate" in value
          ? (value as { toDate: () => Date }).toDate()
          : typeof value === "number"
            ? new Date(value)
            : new Date(String(value))
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return ""
  }
}
