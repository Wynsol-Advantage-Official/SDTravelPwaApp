"use client"

import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { useSavedDiamonds } from "@/hooks/useSavedDiamonds"
import { AuthGuard } from "@/components/auth/AuthGuard"
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
        <h1 className="font-serif text-2xl font-bold text-charcoal">
          Saved Diamonds
        </h1>
        <span className="text-sm text-charcoal/50">
          {saved.length} tour{saved.length !== 1 ? "s" : ""} saved
        </span>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-charcoal/50">Loading your saved diamonds…</p>
        </div>
      ) : saved.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-4xl text-gold/30">♦</div>
          <p className="text-charcoal/50">
            You haven&apos;t saved any tours yet.
          </p>
          <p className="mt-1 text-xs text-charcoal/40">
            Browse our tours and tap the diamond icon to save your favorites.
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
              className="group overflow-hidden rounded-sm border border-sand/20 bg-white transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={diamond.heroImageSrc || "/og/default.jpg"}
                  alt={diamond.tourTitle}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Saved badge */}
                <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm text-charcoal">
                  ♦
                </div>
              </div>
              <div className="p-4">
                <Link
                  href={`/tours/${diamond.tourSlug}`}
                  className="font-serif text-lg font-semibold text-charcoal transition-colors group-hover:text-ocean"
                >
                  {diamond.tourTitle}
                </Link>
                {diamond.notes && (
                  <p className="mt-1 text-xs text-charcoal/50">
                    &ldquo;{diamond.notes}&rdquo;
                  </p>
                )}
                <p className="mt-2 text-[10px] text-charcoal/30">
                  Saved {new Date(diamond.savedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
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
