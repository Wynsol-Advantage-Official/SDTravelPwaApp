#!/usr/bin/env node
// ---------------------------------------------------------------------------
// grant-role.mjs — Set multi-tenant role claims on a Firebase user
// ---------------------------------------------------------------------------
// Usage:
//   node scripts/grant-role.mjs <uid> <role> [tenantId]
//
// Examples:
//   node scripts/grant-role.mjs abc123 super_admin
//   node scripts/grant-role.mjs def456 tenant_admin tenant-a
//   node scripts/grant-role.mjs ghi789 user
//
// Roles: user | tenant_admin | super_admin
// tenantId is required for tenant_admin, ignored for others.
// ---------------------------------------------------------------------------

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { config } from "dotenv";

config({ path: ".env.local" });

const VALID_ROLES = ["user", "tenant_admin", "super_admin"];

const [, , uid, role, tenantId] = process.argv;

if (!uid || !role) {
  console.error("Usage: node scripts/grant-role.mjs <uid> <role> [tenantId]");
  console.error("Roles:", VALID_ROLES.join(" | "));
  process.exit(1);
}

if (!VALID_ROLES.includes(role)) {
  console.error(`Invalid role "${role}". Must be one of: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

if (role === "tenant_admin" && !tenantId) {
  console.error("tenant_admin role requires a tenantId argument.");
  process.exit(1);
}

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

const auth = getAuth();

try {
  // Resolve email to uid if an email was provided
  let targetUid = uid
  if (uid && uid.includes('@')) {
    try {
      const u = await auth.getUserByEmail(uid)
      targetUid = u.uid
    } catch (err) {
      console.error(`Could not find user by email ${uid}:`, err.message)
      process.exit(1)
    }
  }

  const claims = {
    role,
    tenantId: role === "tenant_admin" ? tenantId : null,
    // Keep legacy admin claim for backward compat during migration
    admin: role === "super_admin" || role === "tenant_admin",
  };

  await auth.setCustomUserClaims(targetUid, claims);

  const user = await auth.getUser(targetUid);
  console.log(`✓ Set claims on ${user.email ?? targetUid}:`);
  console.log(JSON.stringify(claims, null, 2));
} catch (err) {
  console.error("Failed to set claims:", err.message || err);
  process.exit(1);
}
