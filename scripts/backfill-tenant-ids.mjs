#!/usr/bin/env node
// ---------------------------------------------------------------------------
// backfill-tenant-ids.mjs — Migrate existing Firestore data to multi-tenant
// ---------------------------------------------------------------------------
// Adds tenantId: "www" to all existing documents that don't have one.
// Creates the initial /tenants/www document.
// Sets role: "user" claim on all Firebase Auth users who don't have a role.
//
// Usage:
//   node scripts/backfill-tenant-ids.mjs [--dry-run]
//
// IMPORTANT: Run this ONCE during the multi-tenant migration. It is idempotent
// — re-running it will skip documents and users that already have tenantId/role.
// ---------------------------------------------------------------------------

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { config } from "dotenv";

config({ path: ".env.local" });

const DRY_RUN = process.argv.includes("--dry-run");
const DEFAULT_TENANT_ID = "www";

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

// ---------------------------------------------------------------------------
// 1. Create /tenants/www document if it doesn't exist
// ---------------------------------------------------------------------------
async function ensureDefaultTenant() {
  const ref = db.collection("tenants").doc(DEFAULT_TENANT_ID);
  const snap = await ref.get();

  if (snap.exists) {
    console.log("  /tenants/www already exists — skipping.");
    return;
  }

  const doc = {
    tenantId: DEFAULT_TENANT_ID,
    name: "Sand Diamonds Travel",
    wixSiteId: process.env.WIX_META_SITE_ID || process.env.WIX_SITE_ID || "",
    domain: "sanddiamonds.travel",
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (DRY_RUN) {
    console.log("  [DRY RUN] Would create /tenants/www:", doc);
  } else {
    await ref.set(doc);
    console.log("  ✓ Created /tenants/www");
  }
}

// ---------------------------------------------------------------------------
// 2. Backfill tenantId on all documents in a collection
// ---------------------------------------------------------------------------
async function backfillCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  let updated = 0;
  let skipped = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.tenantId) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would set tenantId on ${collectionName}/${docSnap.id}`);
    } else {
      await docSnap.ref.update({ tenantId: DEFAULT_TENANT_ID });
    }
    updated++;
  }

  console.log(`  ${collectionName}: ${updated} updated, ${skipped} already had tenantId`);
}

// ---------------------------------------------------------------------------
// 3. Backfill tenantId on chatRooms (top-level docs only — messages inherit)
// ---------------------------------------------------------------------------
async function backfillChatRooms() {
  await backfillCollection("chatRooms");
}

// ---------------------------------------------------------------------------
// 4. Set role claims on all Firebase Auth users
// ---------------------------------------------------------------------------
async function backfillUserClaims() {
  let pageToken;
  let updated = 0;
  let skipped = 0;

  do {
    const result = await auth.listUsers(1000, pageToken);

    for (const user of result.users) {
      const claims = user.customClaims || {};

      // Skip if already has the new role claim
      if (claims.role) {
        skipped++;
        continue;
      }

      // Preserve existing admin status
      const isExistingAdmin = claims.admin === true;
      const newClaims = {
        ...claims,
        role: isExistingAdmin ? "super_admin" : "user",
        tenantId: null,
      };

      if (DRY_RUN) {
        console.log(`  [DRY RUN] Would set claims on ${user.email ?? user.uid}:`, newClaims);
      } else {
        await auth.setCustomUserClaims(user.uid, newClaims);
      }
      updated++;
    }

    pageToken = result.pageToken;
  } while (pageToken);

  console.log(`  Users: ${updated} updated, ${skipped} already had role claim`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nMulti-tenant migration${DRY_RUN ? " (DRY RUN)" : ""}\n`);

  console.log("Step 1: Ensure /tenants/www document");
  await ensureDefaultTenant();

  console.log("\nStep 2: Backfill bookings");
  await backfillCollection("bookings");

  console.log("\nStep 3: Backfill chatRooms");
  await backfillChatRooms();

  console.log("\nStep 4: Backfill user auth claims");
  await backfillUserClaims();

  console.log("\n✓ Migration complete.\n");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
