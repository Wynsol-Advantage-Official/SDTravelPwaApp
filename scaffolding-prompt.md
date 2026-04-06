# SD Travel PWA — Architecture Scaffolding Prompt

> **Before executing any of the work below, create a new branch:**
>
> ```bash
> git checkout -b refactor/architecture-scaffold
> ```
>
> All changes described in this prompt MUST be committed to this branch. Do not modify `main` directly.

---

## Objective

Refactor the SD Travel PWA codebase to enforce a clean, scalable, offline-first architecture. The app is a **Next.js 15 App Router** project backed by **Firebase** (Auth + Firestore) and **Wix** (CMS + eCommerce). The current codebase has business logic, Firestore calls, and API fetches embedded directly inside UI components and page files. This prompt defines every structural change needed to separate concerns, centralize API access, and prepare the codebase for scaling and white-label templating.

---

## Table of Contents

1. [Create the folder structure](#1-create-the-folder-structure)
2. [Centralized API client](#2-centralized-api-client)
3. [Business rules layer](#3-business-rules-layer)
4. [Services layer](#4-services-layer)
5. [Extract logic from pages into hooks](#5-extract-logic-from-pages-into-hooks)
6. [Extract logic from components](#6-extract-logic-from-components)
7. [Client / server separation](#7-client--server-separation)
8. [Code splitting & modularity](#8-code-splitting--modularity)
9. [Component-first design enforcement](#9-component-first-design-enforcement)
10. [Mobile-dedicated design standards](#10-mobile-dedicated-design-standards)
11. [Offline-first approach](#11-offline-first-approach)
12. [PWA best practices](#12-pwa-best-practices)
13. [Structure for scaling](#13-structure-for-scaling)
14. [Structure for templating](#14-structure-for-templating)
15. [Validation checklist](#15-validation-checklist)

---

## 1. Create the Folder Structure

Create the following new directories. Do NOT delete or move any existing files yet — only create the empty folders and placeholder `index.ts` barrel files where noted.

```
src/
  lib/
    api/
      client.ts           ← centralized HTTP client (create in step 2)
      bookings.ts         ← typed booking endpoint wrappers
      contact.ts          ← typed contact endpoint wrapper
      wix.ts              ← typed Wix proxy endpoint wrappers
      index.ts            ← barrel: re-export all API functions
    rules/
      booking-rules.ts    ← pure booking business rules
      chat-rules.ts       ← pure chat business rules
      pricing-rules.ts    ← pure pricing calculations
      status-rules.ts     ← booking status transition logic
      index.ts            ← barrel
    services/
      bookings.service.ts ← booking orchestration (calls Firebase + rules)
      chat.service.ts     ← chat orchestration
      profile.service.ts  ← profile CRUD orchestration
      tours.service.ts    ← tour data fetching orchestration
      index.ts            ← barrel
  app/
    _templates/
      page-template.tsx   ← standard page shell (AuthGuard, skeleton, error, empty)
      page-server-template.tsx ← server component page shell
    api/                  ← (already exists — no changes to structure)
  components/
    _templates/
      component-template.tsx ← standard component boilerplate
```

### Commands

```bash
mkdir -p src/lib/api src/lib/rules src/lib/services
mkdir -p src/app/_templates src/components/_templates
touch src/lib/api/index.ts src/lib/rules/index.ts src/lib/services/index.ts
```

---

## 2. Centralized API Client

### 2a. Install axios

```bash
npm install axios
```

### 2b. Create `src/lib/api/client.ts`

This is the single HTTP client for the entire app. Every outbound API call flows through it.

```typescript
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { auth } from "@/lib/firebase/client"

// ---------------------------------------------------------------------------
// Normalized error shape returned by all API calls
// ---------------------------------------------------------------------------
export interface ApiError {
  message: string
  code: string
  status: number
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
})

// ---------------------------------------------------------------------------
// Request interceptor — attach Firebase Auth token automatically
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // If token retrieval fails, send the request unauthenticated.
    // The server will reject it if auth is required.
  }
  return config
})

// ---------------------------------------------------------------------------
// Response interceptor — normalize errors
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status ?? 0
    const message =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred"
    const code = error.code ?? "UNKNOWN"

    if (process.env.NODE_ENV === "development") {
      console.error(`[API ${status}] ${code}: ${message}`)
    }

    return Promise.reject({ message, code, status } satisfies ApiError)
  },
)

export default apiClient
```

### 2c. Create typed API wrappers

**`src/lib/api/bookings.ts`** — wraps every `/api/bookings/*` endpoint:

```typescript
import apiClient from "./client"
import type { EnrichedBooking, BookingStatus } from "@/types/booking"

export async function fetchAdminBookings(): Promise<EnrichedBooking[]> {
  const { data } = await apiClient.get<{ bookings: EnrichedBooking[] }>(
    "/api/bookings/admin-list",
  )
  return data.bookings
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
): Promise<void> {
  await apiClient.patch("/api/bookings/update-status", { bookingId, newStatus })
}

export async function resolveHeroImages(
  tourIds: string[],
): Promise<Record<string, string | null>> {
  const { data } = await apiClient.post<Record<string, string | null>>(
    "/api/bookings/resolve-heroes",
    { tourIds },
  )
  return data
}
```

**`src/lib/api/contact.ts`**:

```typescript
import apiClient from "./client"

export interface ContactPayload {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export interface ContactResult {
  isExistingUser: boolean
}

export async function submitContactForm(
  payload: ContactPayload,
): Promise<ContactResult> {
  const { data } = await apiClient.post<ContactResult>("/api/contact", payload)
  return data
}
```

**`src/lib/api/wix.ts`**:

```typescript
import apiClient from "./client"
import type { Accommodation } from "@/types/tour"

export async function fetchAccommodation(
  id: string,
): Promise<Accommodation | null> {
  const { data } = await apiClient.get(`/api/wix/debug/accommodations`, {
    params: { id },
  })
  return data?.accommodation ?? data ?? null
}
```

**`src/lib/api/index.ts`** — barrel:

```typescript
export { default as apiClient } from "./client"
export * from "./bookings"
export * from "./contact"
export * from "./wix"
```

---

## 3. Business Rules Layer

Pure functions only. No imports from Firebase, Wix, React, Next.js, or axios. No async. Must be testable with plain `vitest` / `jest` — no mocks required.

### 3a. `src/lib/rules/status-rules.ts`

Extract from `src/components/dashboard/BookingCard.tsx` the `STATUS_ACTIONS`, `STATUS_BADGE`, `STATUS_ICON`, `STATUS_LABEL` constants and the transition logic:

```typescript
import type { BookingStatus } from "@/types/booking"

export interface StatusAction {
  label: string
  to: BookingStatus
  style: string
}

export const STATUS_ACTIONS: Record<string, StatusAction[]> = {
  hold: [
    { label: "Approve", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Awaiting Payment", to: "awaiting_payment", style: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Decline", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  pending: [
    { label: "Confirm", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Awaiting Payment", to: "awaiting_payment", style: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  awaiting_payment: [
    { label: "Confirm Payment", to: "confirmed", style: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
  confirmed: [
    { label: "Complete", to: "completed", style: "bg-ocean hover:bg-ocean/90 text-white" },
    { label: "Cancel", to: "cancelled", style: "bg-red-600 hover:bg-red-700 text-white" },
  ],
}

export const STATUS_BADGE: Record<BookingStatus, string> = {
  hold: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-sand-50 text-sand-600 border-sand-200",
  awaiting_payment: "bg-purple-100 text-purple-800 border-purple-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-ocean-50 text-ocean border-ocean-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  hold: "Hold",
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

/**
 * Returns true if the status transition is allowed.
 */
export function canTransition(
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  const allowed = STATUS_ACTIONS[from]
  if (!allowed) return false
  return allowed.some((a) => a.to === to)
}

/**
 * Returns the list of valid next actions for a given status.
 */
export function getAvailableActions(status: BookingStatus): StatusAction[] {
  return STATUS_ACTIONS[status] ?? []
}
```

### 3b. `src/lib/rules/pricing-rules.ts`

```typescript
/**
 * Calculate total price. This is the ONLY place where price math lives.
 */
export function calculateTotalPrice(
  guests: number,
  pricePerPerson: number,
): number {
  return guests * pricePerPerson
}
```

### 3c. `src/lib/rules/booking-rules.ts`

```typescript
import type { PickupDetails } from "@/types/booking"

/**
 * Validate whether all required booking fields are present.
 */
export function isBookingValid(params: {
  tourDate: string
  guests: number
  arrivingByAir: boolean | null
  pickup: PickupDetails | null
}): boolean {
  if (!params.tourDate || params.guests < 1 || params.arrivingByAir === null) {
    return false
  }
  if (!params.pickup) return false
  return isPickupValid(params.pickup)
}

export function isPickupValid(pickup: PickupDetails): boolean {
  switch (pickup.type) {
    case "flight":
      return !!(
        pickup.departureCountry &&
        pickup.departureAirport &&
        pickup.arrivalAirport &&
        pickup.arrivalDate &&
        pickup.arrivalTime
      )
    case "resort":
      return !!(pickup.hotelName && pickup.hotelAddress && pickup.roomNumber)
    case "airbnb":
      return !!pickup.address
    default:
      return false
  }
}
```

### 3d. `src/lib/rules/index.ts`

```typescript
export * from "./status-rules"
export * from "./pricing-rules"
export * from "./booking-rules"
```

---

## 4. Services Layer

Async orchestrators. These import from `src/lib/firebase/`, `src/lib/api/`, and `src/lib/rules/`. They return typed results. No JSX. No React imports.

### 4a. `src/lib/services/profile.service.ts`

Extract the Firestore `getDoc` / `setDoc` logic currently inline in `src/app/dashboard/profile/page.tsx`:

```typescript
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import type { UserProfile, UserPreferences } from "@/types/user"

/**
 * Fetch the user profile from Firestore.
 * Returns null if the profile document does not exist.
 */
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid, "profile", "main")
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as UserProfile) : null
}

/**
 * Save (merge) profile fields to Firestore.
 */
export async function saveProfile(
  uid: string,
  fields: {
    displayName: string
    phone: string
    preferences: {
      travelStyle: UserPreferences["travelStyle"] | null
      budgetRange: UserPreferences["budgetRange"] | null
    }
  },
): Promise<void> {
  const ref = doc(db, "users", uid, "profile", "main")
  await setDoc(
    ref,
    {
      ...fields,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
```

### 4b. `src/lib/services/bookings.service.ts`

Extract the Firestore `onSnapshot` listener setup currently duplicated in `dashboard/page.tsx`, `dashboard/bookings/page.tsx`, and `my-bookings/page.tsx`:

```typescript
import {
  collection,
  query,
  where,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import type { Booking } from "@/types/booking"

/**
 * Subscribe to a user's bookings in real time.
 * Returns an unsubscribe function.
 */
export function subscribeToUserBookings(
  uid: string,
  onData: (bookings: Booking[]) => void,
  onError?: (err: Error) => void,
  maxResults?: number,
): Unsubscribe {
  const ref = collection(db, "bookings")
  const constraints = [
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
  ]
  if (maxResults) constraints.push(fbLimit(maxResults))

  const q = query(ref, ...constraints)

  return onSnapshot(
    q,
    (snap) => {
      const items: Booking[] = snap.docs.map((d) => ({
        _id: d.id,
        ...(d.data() as Omit<Booking, "_id">),
      }))
      onData(items)
    },
    (err) => {
      console.error("[BookingsService] Listener error:", err)
      onError?.(err)
    },
  )
}
```

### 4c. `src/lib/services/tours.service.ts`

Extract the accommodation image fetch logic currently inline in `TourDetails.tsx`:

```typescript
import { fetchAccommodation } from "@/lib/api/wix"
import type { Accommodation } from "@/types/tour"

/**
 * Resolve missing accommodation images by fetching from Wix API.
 * Returns a map of accommodation _id → { src, alt }.
 */
export async function resolveAccommodationImages(
  accommodations: Accommodation[],
): Promise<Record<string, { src: string; alt?: string }>> {
  const DEFAULT_SRC = "/og/default.jpg"
  const results: Record<string, { src: string; alt?: string }> = {}

  const missing = accommodations.filter((acc) => {
    const hasLocal =
      (acc.image?.src && acc.image.src !== DEFAULT_SRC) ||
      (acc.gallery && acc.gallery.length > 0 && acc.gallery[0].src && acc.gallery[0].src !== DEFAULT_SRC)
    return !hasLocal && acc._id
  })

  await Promise.allSettled(
    missing.map(async (acc) => {
      const found = await fetchAccommodation(acc._id)
      if (found?.image?.src) {
        results[acc._id] = { src: found.image.src, alt: found.image.alt }
      }
    }),
  )

  return results
}
```

### 4d. `src/lib/services/index.ts`

```typescript
export * from "./profile.service"
export * from "./bookings.service"
export * from "./tours.service"
```

---

## 5. Extract Logic from Pages into Hooks

For each page that currently has inline Firestore queries, create or update a hook and have the page use it instead.

### 5a. Create `src/hooks/useUserBookings.ts`

Replaces the inline `onSnapshot` in `dashboard/page.tsx`, `dashboard/bookings/page.tsx`:

```typescript
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { subscribeToUserBookings } from "@/lib/services/bookings.service"
import { mockBookings } from "@/mocks"
import type { Booking } from "@/types/booking"

export function useUserBookings(maxResults?: number) {
  const { user } = useAuth()
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

    const unsub = subscribeToUserBookings(
      user.uid,
      (items) => {
        setBookings(items)
        setLoading(false)
      },
      () => setLoading(false),
      maxResults,
    )

    return unsub
  }, [user, isMockMode, maxResults])

  return { bookings, loading }
}
```

### 5b. Create `src/hooks/useProfile.ts`

Replaces the inline `getDoc` / `setDoc` in `dashboard/profile/page.tsx`:

```typescript
"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useMockMode } from "@/hooks/useMockMode"
import { getProfile, saveProfile } from "@/lib/services/profile.service"
import { mockUserProfile } from "@/mocks"
import type { UserProfile, UserPreferences } from "@/types/user"

export function useProfile() {
  const { user } = useAuth()
  const { isMockMode } = useMockMode()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isMockMode) {
      setProfile(mockUserProfile)
      setLoading(false)
      return
    }
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    getProfile(user.uid)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, isMockMode])

  const save = useCallback(
    async (fields: {
      displayName: string
      phone: string
      preferences: {
        travelStyle: UserPreferences["travelStyle"] | null
        budgetRange: UserPreferences["budgetRange"] | null
      }
    }) => {
      if (isMockMode || !user) return
      setSaving(true)
      setError(null)
      try {
        await saveProfile(user.uid, fields)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed")
      } finally {
        setSaving(false)
      }
    },
    [user, isMockMode],
  )

  return { profile, loading, saving, error, save }
}
```

### 5c. Refactor pages

After creating the hooks above, update each page:

**`src/app/dashboard/page.tsx`** — Remove: `import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore"`, `import { db }`, and the inline `useEffect` with `onSnapshot`. Replace with:
```typescript
import { useUserBookings } from "@/hooks/useUserBookings"
// ...
const { bookings, loading } = useUserBookings(10)
```

**`src/app/dashboard/bookings/page.tsx`** — Same pattern. Remove Firestore imports, use `useUserBookings()`.

**`src/app/my-bookings/page.tsx`** — Remove the duplicate `onAuthStateChanged` + `onSnapshot` block. Use `useAuth` + `useUserBookings()`. The page currently maintains its own auth state (`useState<User | null>`) — delete that entirely and use the existing `useAuth` hook.

**`src/app/dashboard/profile/page.tsx`** — Remove `import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"` and `import { db }`. Replace the inline `useEffect` fetch and `handleSave` with `useProfile()`:
```typescript
import { useProfile } from "@/hooks/useProfile"
// ...
const { profile, loading, saving, error, save } = useProfile()
```

---

## 6. Extract Logic from Components

### 6a. `src/components/dashboard/BookingCard.tsx`

**Problem:** Contains a module-level `heroCache` Map, `inflight` Map, and calls `fetch("/api/bookings/resolve-heroes")` directly inside a `useEffect`.

**Fix:**
1. Move `STATUS_ACTIONS`, `STATUS_BADGE`, `STATUS_ICON`, `STATUS_LABEL` to `src/lib/rules/status-rules.ts` (done in step 3a). Import them.
2. Move `getTourGradient()` to `src/lib/utils/tour-gradients.ts` — it's a pure mapping function, not component logic.
3. Remove the hero image fetch. Instead, have the **parent page** batch-resolve hero images for all visible bookings using `resolveHeroImages(tourIds)` from `src/lib/api/bookings.ts`, and pass `heroImage` as a prop.
4. The component should accept `heroImage?: string | null` as a prop and do zero fetching.

### 6b. `src/components/tours/TourDetails.tsx`

**Problem:** Calls `fetch(/api/wix/debug/accommodations?id=...)` per-accommodation inside a `useEffect` loop.

**Fix:**
1. The **parent page** (`src/app/tours/[slug]/page.tsx`) should call `resolveAccommodationImages(accommodations)` from `src/lib/services/tours.service.ts` and pass the resolved images as a prop.
2. `TourDetails` receives `remoteAccImages: Record<string, { src: string; alt?: string }>` as a prop.
3. Remove the fetch `useEffect` entirely from the component.

### 6c. `src/components/contact/ContactForm.tsx`

**Problem:** Calls `fetch("/api/contact")` directly.

**Fix:**
1. Replace the inline `fetch` with `submitContactForm(form)` from `src/lib/api/contact.ts`.
2. This is a self-contained form component so this is a minor violation — acceptable to keep the API call inside a `handleSubmit` using the typed wrapper rather than extracting a hook. But it MUST use the centralized API client, not raw `fetch`.

---

## 7. Client / Server Separation

### Rules — enforce strictly

| Layer | Allowed imports | Forbidden imports |
|---|---|---|
| `src/app/api/**` (Route Handlers) | `firebase/admin`, `src/lib/firebase/admin.ts`, `src/lib/wix/*-server*`, Node.js APIs | `src/lib/firebase/client.ts`, React, any `"use client"` module |
| `src/app/**/page.tsx` (Server Components) | `src/lib/services/*`, `src/lib/rules/*`, `src/lib/api/*` (for server-side fetch), `src/types/*` | `useState`, `useEffect`, `useAuth`, `useChat`, browser APIs |
| `src/app/**/page.tsx` (`"use client"`) | `src/hooks/*`, `src/components/*`, `src/lib/rules/*`, `src/types/*` | `firebase/admin`, env vars without `NEXT_PUBLIC_` |
| `src/components/**` | Props only. `src/lib/rules/*` (for display logic like badges), `src/lib/utils/*` | `fetch`, `axios`, `setDoc`, `getDoc`, `onSnapshot`, `src/lib/services/*` |
| `src/hooks/**` | `src/lib/services/*`, `src/lib/api/*`, `src/lib/rules/*`, React hooks | `firebase/admin`, JSX |

### Server Component → Client Component handoff pattern

When a page needs both SSR data and real-time client updates:

```tsx
// src/app/tours/[slug]/page.tsx (Server Component — NO "use client")
import { getTourBySlug } from "@/lib/services/tours.service"
import { TourPageClient } from "./TourPageClient"

export default async function TourPage({ params }: { params: { slug: string } }) {
  const tour = await getTourBySlug(params.slug)
  return <TourPageClient initialTour={tour} />
}
```

```tsx
// src/app/tours/[slug]/TourPageClient.tsx ("use client")
"use client"
import { TourDetails } from "@/components/tours/TourDetails"
// Client-side hooks for real-time updates if needed
```

### Action items

1. Audit all `src/app/api/` route handlers — confirm none import `src/lib/firebase/client.ts`. If any do, switch to `src/lib/firebase/admin.ts`.
2. Push the `"use client"` boundary deeper: if a page only needs one interactive section, extract that section into a Client Component and keep the page as a Server Component.
3. Create a lint rule or comment convention: `// @server-only` at the top of admin.ts and server Wix files.

---

## 8. Code Splitting & Modularity

### Dynamic imports for heavy components

Wrap these in `next/dynamic` with `{ ssr: false }`:

- `BookingDetailModal` — heavy modal with animations
- `ConciergeInbox` — real-time chat, large component
- `LuxuryGallery` — image carousel with motion
- `ItineraryTimeline` — animated timeline
- `RouteMap` — if map library is used

Example:
```typescript
import dynamic from "next/dynamic"

const BookingDetailModal = dynamic(
  () => import("@/components/dashboard/BookingDetailModal").then(m => ({ default: m.BookingDetailModal })),
  { ssr: false },
)
```

### File size rule

- Maximum **300 lines** per file. If a file exceeds this, split it:
  - Extract sub-components into the same folder
  - Extract helpers into `utils/` or `rules/`
  - Extract types into `types/`

### Barrel exports

Every feature folder must have an `index.ts`:

```
src/components/booking/index.ts         → export { BookingForm } from "./BookingForm"
src/components/dashboard/index.ts       → export { BookingCard } from "./BookingCard"
src/lib/rules/index.ts                  → export * from "./status-rules"
src/lib/services/index.ts               → export * from "./bookings.service"
```

Import from barrels:
```typescript
// Good
import { BookingCard, ConciergeInbox } from "@/components/dashboard"
// Bad
import { BookingCard } from "@/components/dashboard/BookingCard"
```

---

## 9. Component-First Design Enforcement

### Component hierarchy

```
ui/          → Atoms: Button, Card, Modal, Badge, Input, Skeleton, FadeSlide
{feature}/   → Molecules/Organisms: BookingCard, ChatBubble, TourCard
sections/    → Page sections: CTASection, FeaturedTours, HeroSection
app/         → Pages: compose sections + hooks only
```

### Rules for every component

1. **Explicit TypeScript prop interface** — no `any`, no implicit prop spreading
2. **Props-in, callbacks-out** — all data via props, all mutations via `onX` callbacks
3. **No internal data fetching** — no `fetch`, no `setDoc`, no `onSnapshot`
4. **Stateless by default** — `useState` only for truly local UI state (open/closed, hover, active tab, animation state)
5. **Children typed explicitly** — `children: React.ReactNode` when used

### Template for new components

Create `src/components/_templates/component-template.tsx`:

```tsx
"use client"

// ---------------------------------------------------------------------------
// [ComponentName]
// ---------------------------------------------------------------------------

interface [ComponentName]Props {
  // Required props
  // Optional display props
  className?: string
}

export function [ComponentName]({ className }: [ComponentName]Props) {
  return (
    <div className={className}>
      {/* implementation */}
    </div>
  )
}
```

---

## 10. Mobile-Dedicated Design Standards

### Base rules

- **Mobile-first CSS**: base styles target mobile (< 640 px), layer up with `sm:`, `md:`, `lg:`
- **Touch targets**: minimum `min-h-11 min-w-11` (44 × 44 px) on all interactive elements
- **Font sizes**: minimum `text-sm` (14 px); use `text-base` (16 px) for `<input>` to prevent iOS auto-zoom
- **Safe areas**: all `fixed` overlays include `pb-[env(safe-area-inset-bottom)]`
- **No hover-only affordances**: every `:hover` style must have a visible default state

### Navigation

- Mobile (< `sm`): `MobileBottomNav` is the primary nav. Do not render sidebar.
- Desktop (`sm`+): `Header` with top nav. `MobileBottomNav` hidden.

### Full-screen mobile patterns

Modals, chat panels, and detail pages on mobile:

```tsx
// Full-screen on mobile, floating panel on desktop
className="fixed inset-0 z-40 flex flex-col bg-white
           sm:inset-auto sm:bottom-24 sm:right-6 sm:h-120 sm:w-90 sm:rounded-2xl sm:shadow-xl"
```

### Testing widths

Every new UI must be visually tested at:
- 375 px (iPhone SE)
- 390 px (iPhone 15)
- 768 px (iPad)
- 1280 px (Desktop)

---

## 11. Offline-First Approach

### Firestore reads

Already handled — `persistentLocalCache` is enabled in `src/lib/firebase/client.ts`. All reads automatically serve from cache when offline. No changes needed.

### Firestore writes

Automatically queued by the SDK when offline and replayed on reconnect. No manual retry logic needed.

### API writes (non-Firestore)

For API routes (`/api/*`), implement optimistic UI:

```typescript
// In the hook or service:
// 1. Update local state immediately (optimistic)
// 2. Fire the API call
// 3. On error, rollback local state and show error toast
```

For forms that call API routes (contact, booking):
- On submit failure due to network: store payload in IndexedDB
- Register a `BackgroundSync` event in the service worker
- When connectivity returns, replay the stored payload

### Offline indicator

`src/components/pwa/OfflineBanner.tsx` already exists. Ensure it is rendered in the root layout and listens to `navigator.onLine` / `window.addEventListener("online")`.

### Pre-cache critical data

On first authenticated load, trigger Firestore listeners for:
- User profile (`users/{uid}/profile/main`)
- Active bookings (status != `cancelled` && status != `completed`)
- Chat rooms (`chatRooms` where `clientUid == uid`)

This ensures the data is in the local cache before the user goes offline.

---

## 12. PWA Best Practices

### Web manifest (`public/manifest.json`)

Ensure these fields are set:

```json
{
  "name": "Sand Diamonds Travel",
  "short_name": "SD Travel",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Service worker caching strategy (`public/sw.js`)

Register routes by pattern:

| Pattern | Strategy | Max Age |
|---|---|---|
| `/` , `/tours`, `/destinations` (navigation) | NetworkFirst, fallback to cache | — |
| `/api/bookings/*` | NetworkFirst, fallback to cache | — |
| `/api/contact` | NetworkOnly + BackgroundSync | — |
| `/_next/static/**` | CacheFirst | 1 year |
| `/icons/*`, `/fonts/*` | CacheFirst | 1 year |
| `wix image CDN (static.wixstatic.com)` | StaleWhileRevalidate | 1 hour |
| `/tours/*`, `/destinations/*` (pages) | StaleWhileRevalidate | 1 hour |

### Every new API route

When adding a new `src/app/api/` route, also add its URL pattern to `public/sw.js` with the appropriate caching strategy.

### iOS support

- `IOSInstallPrompt` component (already exists) handles `beforeinstallprompt` absence on Safari
- Add `<meta name="apple-mobile-web-app-capable" content="yes">` to root layout
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- Add `<link rel="apple-touch-icon" href="/icons/icon-192.png">`

---

## 13. Structure for Scaling

### Domain isolation

Each domain is self-contained across all layers:

```
Bookings:   rules/booking-rules.ts → services/bookings.service.ts → hooks/useUserBookings.ts → components/booking/*
Chat:       rules/chat-rules.ts    → services/chat.service.ts     → hooks/useChat.ts         → components/dashboard/ChatBubble, ConciergeInbox
Profile:    (no rules needed)      → services/profile.service.ts  → hooks/useProfile.ts       → app/dashboard/profile/
Tours:      (no rules needed)      → services/tours.service.ts    → hooks/useTours.ts         → components/tours/*
Contact:    (no rules needed)      → api/contact.ts               → (inline in form)          → components/contact/ContactForm
```

Adding a new domain (e.g., Payments) follows the same pattern:
1. `src/types/payment.ts`
2. `src/lib/rules/payment-rules.ts`
3. `src/lib/services/payment.service.ts`
4. `src/lib/api/payments.ts`
5. `src/hooks/usePayment.ts`
6. `src/components/payment/PaymentForm.tsx`
7. `src/app/payment/page.tsx`
8. `src/mocks/payment.ts`

### State management scale plan

- **Now**: Context providers (`useAuth`, `useMockMode`) + local hooks
- **When needed**: Add Zustand for cross-tree state (e.g., a notification system that spans header + dashboard + chat)
- **Never**: Redux — overkill for this app's data flow

### Database scale plan

- Firestore sub-collections for per-user data (already: `users/{uid}/profile/main`)
- Composite indexes defined in `firestore.indexes.json`
- Security rules in `firestore.rules` with the `isAdmin()` helper

---

## 14. Structure for Templating

### Page templates

Create `src/app/_templates/page-template.tsx`:

```tsx
"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"

/**
 * Standard authenticated page template.
 * Copy this file when creating a new page.
 *
 * Includes:
 * - AuthGuard wrapper
 * - Loading skeleton
 * - Error state
 * - Empty state
 */
export default function TemplatePage() {
  return (
    <AuthGuard>
      <TemplateContent />
    </AuthGuard>
  )
}

function TemplateContent() {
  // Replace with your hook:
  const loading = false
  const error: string | null = null
  const data: unknown[] = []

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="text-charcoal/50">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-charcoal/50">Nothing here yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-bold text-charcoal">Page Title</h1>
      {/* Page content */}
    </div>
  )
}
```

### Mock data convention

Every new data type MUST have a corresponding mock file:

```
src/mocks/
  bookings.ts      ← already exists
  chat.ts          ← already exists
  tours.ts         ← already exists
  user.ts          ← already exists
  activity.ts      ← already exists
  saved-diamonds.ts ← already exists
  index.ts         ← barrel, already exists
```

The `useMockMode()` hook gates real vs mock data. Every hook must support mock mode:

```typescript
if (isMockMode) {
  setData(mockData)
  setLoading(false)
  return
}
```

### Feature flags

Create `src/lib/utils/flags.ts`:

```typescript
export const FLAGS = {
  ENABLE_PAYMENTS: process.env.NEXT_PUBLIC_FF_PAYMENTS === "true",
  ENABLE_REVIEWS: process.env.NEXT_PUBLIC_FF_REVIEWS === "true",
} as const

export function isEnabled(flag: keyof typeof FLAGS): boolean {
  return FLAGS[flag]
}
```

Guard incomplete features:
```tsx
import { isEnabled } from "@/lib/utils/flags"

{isEnabled("ENABLE_PAYMENTS") && <PaymentSection />}
```

### White-label preparation

- All brand tokens (colors, fonts, company name) are defined in `tailwind.config.ts` and `src/styles/globals.css`. No hardcoded brand strings in components.
- Company name, logo URL, and tagline should come from a `src/lib/config/brand.ts` file:

```typescript
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Sand Diamonds Travel",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Luxury African Travel",
  logo: process.env.NEXT_PUBLIC_BRAND_LOGO ?? "/icons/logo.svg",
  supportEmail: process.env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL ?? "concierge@sanddiamonds.travel",
} as const
```

Components reference `BRAND.name` instead of hardcoding `"Sand Diamonds"`.

---

## 15. Validation Checklist

After completing all steps, verify every item:

### Architecture

- [ ] `src/lib/api/client.ts` exists with axios instance, auth interceptor, error normalization
- [ ] `src/lib/api/` has typed wrappers for every API endpoint
- [ ] `src/lib/rules/` contains all pure business logic (status transitions, pricing, validation)
- [ ] `src/lib/services/` contains all Firestore/API orchestration
- [ ] No `fetch()` or `axios` calls remain directly in components or pages
- [ ] No `setDoc()` / `getDoc()` / `updateDoc()` / `onSnapshot()` remain in pages or components

### Separation

- [ ] No `firebase/admin` imported outside `src/app/api/` or `src/scripts/`
- [ ] No env vars without `NEXT_PUBLIC_` referenced in client code
- [ ] `"use client"` boundary is as deep as possible in each page tree

### Components

- [ ] Every component has an explicit TypeScript prop interface
- [ ] No component exceeds 300 lines
- [ ] Heavy components are `next/dynamic` loaded
- [ ] All interactive elements are ≥ 44 × 44 px

### PWA / Offline

- [ ] `public/manifest.json` has correct `display`, `start_url`, icons
- [ ] `public/sw.js` has routes registered for all API endpoints
- [ ] `OfflineBanner` is rendered in root layout
- [ ] iOS meta tags are in root layout `<head>`

### Mocks & Templates

- [ ] Mock data exists in `src/mocks/` for every data domain
- [ ] Every hook supports `isMockMode` fallback
- [ ] Page template exists at `src/app/_templates/page-template.tsx`
- [ ] Feature flags file exists at `src/lib/utils/flags.ts`
- [ ] Brand config exists at `src/lib/config/brand.ts`

### Final

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes
- [ ] App loads and functions offline after first visit
- [ ] All existing tests still pass

---

## Execution Order

1. **Branch**: `git checkout -b refactor/architecture-scaffold`
2. **Folders**: Create the directory structure (step 1)
3. **API client**: Install axios, create client + wrappers (step 2)
4. **Rules**: Extract pure business rules (step 3)
5. **Services**: Extract async orchestrators (step 4)
6. **Hooks**: Create `useUserBookings`, `useProfile` (step 5)
7. **Refactor pages**: Remove inline Firestore from pages (step 5c)
8. **Refactor components**: Remove inline fetch from components (step 6)
9. **Server/client split**: Audit and fix boundary violations (step 7)
10. **Code splitting**: Add `next/dynamic` imports (step 8)
11. **Templates & flags**: Create templates, flags, brand config (steps 9, 14)
12. **PWA**: Audit service worker routes, manifest, meta tags (steps 11, 12)
13. **Validate**: Run the checklist (step 15)
14. **Commit**: `git add -A && git commit -m "refactor: architecture scaffold — separation of concerns, centralized API, offline-first"`
15. **PR**: Push branch and open PR for review
