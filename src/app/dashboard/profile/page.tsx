"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { useProfile } from "@/hooks/useProfile"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import { mockUserProfile } from "@/mocks"
import type { UserPreferences } from "@/types/user"

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

const TRAVEL_STYLES: NonNullable<UserPreferences["travelStyle"]>[] = [
  "adventure",
  "relaxation",
  "cultural",
  "romantic",
]

const BUDGET_RANGES: NonNullable<UserPreferences["budgetRange"]>[] = [
  "luxury",
  "ultra-luxury",
  "no-limit",
]

const AVATAR_PLACEHOLDER_SRC = "/logos/brand/Iconset-06.png"

function ProfileContent() {
  const { user, signOut } = useAuth()
  const { isMockMode } = useMockMode()
  const { profile, loading, saving, save } = useProfile()

  const [success, setSuccess] = useState(false)

  // Editable fields
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [travelStyle, setTravelStyle] = useState<UserPreferences["travelStyle"]>(undefined)
  const [budgetRange, setBudgetRange] = useState<UserPreferences["budgetRange"]>(undefined)

  useEffect(() => {
    if (isMockMode) {
      setDisplayName(mockUserProfile.displayName)
      setPhone(mockUserProfile.phone ?? "")
      setTravelStyle(mockUserProfile.preferences?.travelStyle)
      setBudgetRange(mockUserProfile.preferences?.budgetRange)
      return
    }

    if (profile) {
      setDisplayName(profile.displayName ?? "")
      setPhone(profile.phone ?? "")
      setTravelStyle(profile.preferences?.travelStyle)
      setBudgetRange(profile.preferences?.budgetRange)
    } else if (user) {
      setDisplayName(user.displayName ?? "")
    }
  }, [profile, user, isMockMode])

  const handleSave = async () => {
    if (isMockMode || !user) return

    setSuccess(false)
    await save({
      displayName,
      phone,
      preferences: {
        travelStyle: travelStyle ?? null,
        budgetRange: budgetRange ?? null,
      },
    })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const avatarUrl = isMockMode
    ? mockUserProfile.avatar
    : user?.photoURL ?? undefined
  const [avatarSrc, setAvatarSrc] = useState(avatarUrl ?? AVATAR_PLACEHOLDER_SRC)
  const email = isMockMode ? mockUserProfile.email : user?.email
  const memberSince = isMockMode
    ? mockUserProfile.createdAt
    : profile?.createdAt

  useEffect(() => {
    setAvatarSrc(avatarUrl ?? AVATAR_PLACEHOLDER_SRC)
  }, [avatarUrl])

  return (
    <div className="space-y-8">
      <h1 className="font-sans text-2xl font-bold text-ocean-deep">
        Profile & Settings
      </h1>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
          <p className="text-ocean-deep/50">Loading profile…</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Profile Card ─────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-sm border border-tan/20 bg-white p-6 text-center">
              <Image
                src={avatarSrc}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                onError={() => {
                  if (avatarSrc !== AVATAR_PLACEHOLDER_SRC) {
                    setAvatarSrc(AVATAR_PLACEHOLDER_SRC)
                  }
                }}
                className="mx-auto rounded-full object-cover"
              />
              <h2 className="mt-4 font-sans text-xl font-semibold text-ocean-deep">
                {displayName || "Traveler"}
              </h2>
              <p className="mt-1 text-sm text-ocean-deep/50">{email}</p>
              {memberSince && (
                <p className="mt-2 text-[10px] uppercase tracking-wider text-ocean-deep/30">
                  Member since{" "}
                  {new Date(memberSince).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <div className="mt-6 border-t border-tan/10 pt-4">
                <button
                  type="button"
                  onClick={signOut}
                  className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* ── Edit Form ────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal Info */}
            <section className="rounded-sm border border-tan/20 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ocean-deep/70">
                Personal Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-1 block text-xs font-medium text-ocean-deep/60"
                  >
                    Display Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 w-full rounded-sm border border-tan/20 bg-white px-4 text-sm text-ocean-deep focus:border-ocean focus:ring-1 focus:ring-ocean"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1 block text-xs font-medium text-ocean-deep/60"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email ?? ""}
                    disabled
                    className="h-11 w-full rounded-sm border border-tan/10 bg-ocean/5 px-4 text-sm text-ocean-deep/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="profile-phone"
                    className="mb-1 block text-xs font-medium text-ocean-deep/60"
                  >
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-11 w-full rounded-sm border border-tan/20 bg-white px-4 text-sm text-ocean-deep placeholder:text-ocean-deep/30 focus:border-ocean focus:ring-1 focus:ring-ocean"
                  />
                </div>
              </div>
            </section>

            {/* Travel Preferences */}
            <section className="rounded-sm border border-tan/20 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ocean-deep/70">
                Travel Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-ocean-deep/60">
                    Travel Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setTravelStyle(style)}
                        className={[
                          "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                          travelStyle === style
                            ? "bg-ocean text-ocean-deep"
                            : "bg-ocean/5 text-ocean-deep/60 hover:bg-ocean-deep/10",
                        ].join(" ")}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-ocean-deep/60">
                    Budget Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_RANGES.map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setBudgetRange(range)}
                        className={[
                          "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                          budgetRange === range
                            ? "bg-ocean text-ocean-deep"
                            : "bg-ocean/5 text-ocean-deep/60 hover:bg-ocean-deep/10",
                        ].join(" ")}
                      >
                        {range === "no-limit" ? "No Limit" : range.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="flex items-center gap-4">
              <Button onClick={handleSave} disabled={saving || isMockMode}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              {success && (
                <p className="text-sm font-medium text-green-600">
                  Profile updated successfully!
                </p>
              )}
              {isMockMode && (
                <p className="text-xs text-ocean-deep/40">
                  Saving is disabled in mock mode.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
