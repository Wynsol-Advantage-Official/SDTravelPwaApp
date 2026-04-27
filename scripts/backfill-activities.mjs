#!/usr/bin/env node
// ---------------------------------------------------------------------------
// backfill-activities.mjs — Seed Firestore activity feeds from existing data
// ---------------------------------------------------------------------------
// For every user this script:
//   1. Reads all their bookings and creates activity events for each
//      (booking_created, and booking_confirmed/completed/cancelled if applicable)
//   2. Creates a one-time "Joined Sand Diamonds" profile_updated event
//      dated to their Firebase Auth account creation time
//
// The script is idempotent — it writes to deterministic document IDs derived
// from booking IDs and uid, so re-running it safely skips existing records.
//
// Usage:
//   node scripts/backfill-activities.mjs [--dry-run]
//
// Env (from .env.local):
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
// Or GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
// ---------------------------------------------------------------------------

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { config } from "dotenv"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

config({ path: ".env.local" })

const __dirname = dirname(fileURLToPath(import.meta.url))
const DRY_RUN = process.argv.includes("--dry-run")

// ---------------------------------------------------------------------------
// Firebase Admin init — supports both env-var credentials and service account
// ---------------------------------------------------------------------------
if (getApps().length === 0) {
  const saPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ??
    resolve(__dirname, "../.dev_only/sdtravel-wynsoladv-669c18b237bc.json")

  if (existsSync(saPath)) {
    const sa = JSON.parse(readFileSync(saPath, "utf8"))
    initializeApp({ credential: cert(sa) })
  } else {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  }
}

const db = getFirestore()
const auth = getAuth()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a Firestore Timestamp, Date, or ISO string to a JS Date. */
function toDate(v) {
  if (!v) return new Date()
  if (v instanceof Timestamp) return v.toDate()
  if (v instanceof Date) return v
  return new Date(v)
}

/** Write an activity doc with a stable ID — skips if it already exists. */
async function writeActivity(uid, stableId, event) {
  const ref = db.collection("users").doc(uid).collection("activity").doc(stableId)

  if (!DRY_RUN) {
    const snap = await ref.get()
    if (snap.exists) return false // already backfilled
    await ref.set(event)
  }

  return true
}

// ---------------------------------------------------------------------------
// Per-booking activity derivation
// ---------------------------------------------------------------------------

/**
 * Returns an array of { stableId, event } objects to write for a single booking.
 *
 * booking_created  — always, dated to booking.createdAt
 * booking_confirmed / booking_completed / booking_cancelled
 *                  — only when status matches, dated to booking.updatedAt
 */
function activityEventsForBooking(bookingId, booking) {
  const events = []

  const createdAt = toDate(booking.createdAt)
  const updatedAt = toDate(booking.updatedAt ?? booking.createdAt)
  const tourTitle = booking.tourTitle ?? "Your booking"
  const tenantId = booking.tenantId ?? null
  const uid = booking.uid

  // ── booking_created ──────────────────────────────────────────────────
  const guestLabel =
    booking.guests === 1 ? "1 guest" : `${booking.guests ?? 1} guests`
  const dateLabel = booking.tourDate ?? (booking.dates?.start ? String(booking.dates.start).slice(0, 10) : "Date TBD")

  events.push({
    stableId: `booking-created-${bookingId}`,
    event: {
      type: "booking_created",
      title: "Booking submitted",
      description: `${tourTitle} — ${dateLabel}, ${guestLabel}`,
      link: "/dashboard/bookings",
      tenantId,
      timestamp: Timestamp.fromDate(createdAt),
    },
  })

  // ── status-derived events ────────────────────────────────────────────
  const STATUS_MAP = {
    confirmed:  { type: "booking_confirmed",  title: "Booking confirmed" },
    completed:  { type: "booking_completed",  title: "Booking completed" },
    cancelled:  { type: "booking_cancelled",  title: "Booking cancelled" },
  }

  const statusDef = STATUS_MAP[booking.status]
  if (statusDef) {
    events.push({
      stableId: `booking-${booking.status}-${bookingId}`,
      event: {
        type: statusDef.type,
        title: statusDef.title,
        description: tourTitle,
        link: "/dashboard/bookings",
        tenantId,
        timestamp: Timestamp.fromDate(updatedAt),
      },
    })
  }

  return events.map((e) => ({ ...e, uid }))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n🔄  Backfilling activities${DRY_RUN ? " (DRY RUN — no writes)" : ""}…\n`)

  let totalWritten = 0
  let totalSkipped = 0
  let totalUsers = 0

  // ── Step 1: Process bookings ──────────────────────────────────────────
  console.log("── Step 1: Booking events ──────────────────────────────────")

  const bookingsSnap = await db.collection("bookings").get()
  console.log(`  Found ${bookingsSnap.size} bookings.\n`)

  for (const doc of bookingsSnap.docs) {
    const booking = doc.data()
    if (!booking.uid) continue

    const eventsToWrite = activityEventsForBooking(doc.id, booking)

    for (const { uid, stableId, event } of eventsToWrite) {
      const written = await writeActivity(uid, stableId, event)
      if (written) {
        totalWritten++
        console.log(`  ✓ [${booking.uid.slice(0, 6)}…] ${event.title} — ${event.description?.slice(0, 60)}`)
      } else {
        totalSkipped++
      }
    }
  }

  // ── Step 2: "Joined" event per user ──────────────────────────────────
  console.log("\n── Step 2: Joined events ───────────────────────────────────")

  let pageToken
  do {
    const result = await auth.listUsers(1000, pageToken)
    totalUsers += result.users.length

    for (const userRecord of result.users) {
      const joinedAt = userRecord.metadata?.creationTime
        ? new Date(userRecord.metadata.creationTime)
        : new Date()

      const stableId = "joined"
      const event = {
        type: "profile_updated",
        title: "Joined Sand Diamonds",
        description: "Account created. Welcome aboard!",
        link: "/dashboard/profile",
        tenantId: userRecord.customClaims?.tenantId ?? null,
        timestamp: Timestamp.fromDate(joinedAt),
      }

      const written = await writeActivity(userRecord.uid, stableId, event)
      if (written) {
        totalWritten++
        console.log(`  ✓ [${userRecord.uid.slice(0, 6)}…] Joined — ${userRecord.email ?? "no email"}`)
      } else {
        totalSkipped++
      }
    }

    pageToken = result.pageToken
  } while (pageToken)

  // ── Summary ───────────────────────────────────────────────────────────
  console.log(`
══════════════════════════════════════════════════
  Backfill complete${DRY_RUN ? " (DRY RUN)" : ""}
  Bookings processed : ${bookingsSnap.size}
  Users processed    : ${totalUsers}
  Events written     : ${totalWritten}
  Already existed    : ${totalSkipped}
══════════════════════════════════════════════════
`)
}

main().catch((err) => {
  console.error("\n✗ Fatal error:", err)
  process.exit(1)
})
