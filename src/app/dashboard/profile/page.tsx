"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { mockUserProfile } from "@/mocks"
import type { UserProfile, UserPreferences } from "@/types/user"

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

function ProfileContent() {
  const { user, signOut } = useAuth()
  const { isMockMode } = useMockMode()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Editable fields
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [travelStyle, setTravelStyle] = useState<UserPreferences["travelStyle"]>(undefined)
  const [budgetRange, setBudgetRange] = useState<UserPreferences["budgetRange"]>(undefined)

  useEffect(() => {
    if (isMockMode) {
      setProfile(mockUserProfile)
      setDisplayName(mockUserProfile.displayName)
      setPhone(mockUserProfile.phone ?? "")
      setTravelStyle(mockUserProfile.preferences?.travelStyle)
      setBudgetRange(mockUserProfile.preferences?.budgetRange)
      setLoading(false)
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    // Fetch profile from Firestore
    const ref = doc(db, "users", user.uid, "profile", "main")
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile
          setProfile(data)
          setDisplayName(data.displayName ?? "")
          setPhone(data.phone ?? "")
          setTravelStyle(data.preferences?.travelStyle)
          setBudgetRange(data.preferences?.budgetRange)
        } else {
          // Use Firebase auth data as fallback
          setDisplayName(user.displayName ?? "")
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, isMockMode])

  const handleSave = async () => {
    if (isMockMode || !user) return

    setSaving(true)
    setSuccess(false)

    try {
      const ref = doc(db, "users", user.uid, "profile", "main")
      // Use set with merge to create the document if it doesn't exist
      await setDoc(
        ref,
        {
          displayName,
          phone,
          preferences: {
            travelStyle: travelStyle ?? null,
            budgetRange: budgetRange ?? null,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Profile save failed:", err)
    } finally {
      setSaving(false)
    }
  }

  const avatarUrl = isMockMode
    ? mockUserProfile.avatar
    : user?.photoURL ?? undefined
  const email = isMockMode ? mockUserProfile.email : user?.email
  const memberSince = isMockMode
    ? mockUserProfile.createdAt
    : profile?.createdAt

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-bold text-charcoal">
        Profile & Settings
      </h1>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-charcoal/50">Loading profile…</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Profile Card ─────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-sm border border-sand/20 bg-white p-6 text-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="mx-auto rounded-full"
                />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold text-2xl font-bold text-charcoal">
                  {(displayName || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="mt-4 font-serif text-xl font-semibold text-charcoal">
                {displayName || "Traveler"}
              </h2>
              <p className="mt-1 text-sm text-charcoal/50">{email}</p>
              {memberSince && (
                <p className="mt-2 text-[10px] uppercase tracking-wider text-charcoal/30">
                  Member since{" "}
                  {new Date(memberSince).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <div className="mt-6 border-t border-sand/10 pt-4">
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
            <section className="rounded-sm border border-sand/20 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-charcoal/70">
                Personal Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-1 block text-xs font-medium text-charcoal/60"
                  >
                    Display Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 w-full rounded-sm border border-sand/20 bg-diamond px-4 text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1 block text-xs font-medium text-charcoal/60"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email ?? ""}
                    disabled
                    className="h-11 w-full rounded-sm border border-sand/10 bg-charcoal/5 px-4 text-sm text-charcoal/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="profile-phone"
                    className="mb-1 block text-xs font-medium text-charcoal/60"
                  >
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-11 w-full rounded-sm border border-sand/20 bg-diamond px-4 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>
            </section>

            {/* Travel Preferences */}
            <section className="rounded-sm border border-sand/20 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-charcoal/70">
                Travel Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-charcoal/60">
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
                            ? "bg-gold text-charcoal"
                            : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10",
                        ].join(" ")}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-charcoal/60">
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
                            ? "bg-gold text-charcoal"
                            : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10",
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
                <p className="text-xs text-charcoal/40">
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
