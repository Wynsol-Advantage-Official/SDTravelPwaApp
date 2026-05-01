#!/usr/bin/env node
// ---------------------------------------------------------------------------
// seed-wix-testimonials.mjs — Backfill the Wix CMS "Testimonials" collection
// ---------------------------------------------------------------------------
// Inserts sample testimonials (with cover image + featured flag) into the
// www tenant's Wix site.
//
// Usage:
//   node scripts/seed-wix-testimonials.mjs              # insert
//   node scripts/seed-wix-testimonials.mjs --dry-run    # preview without writing
//   node scripts/seed-wix-testimonials.mjs --reset      # delete existing + re-insert
//
// Requires (from .env.local):
//   WIX_CLIENT_ID        — Wix OAuth app client ID
//   WIX_CLIENT_SECRET    — Wix OAuth app client secret
//   WIX_META_SITE_ID     — Wix Meta Site ID for the www tenant
// ---------------------------------------------------------------------------

import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8");
  raw.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  });
} else {
  console.warn("[warn] .env.local not found — relying on environment variables");
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DRY_RUN = process.argv.includes("--dry-run");
const RESET = process.argv.includes("--reset");
const COLLECTION = "Testimonials";

const clientId = process.env.WIX_CLIENT_ID;
const clientSecret = process.env.WIX_CLIENT_SECRET;
const siteId = process.env.WIX_META_SITE_ID;

if (!clientId || !clientSecret) {
  console.error("[error] WIX_CLIENT_ID and WIX_CLIENT_SECRET must be set in .env.local");
  process.exit(2);
}
if (!siteId) {
  console.error("[error] WIX_META_SITE_ID must be set in .env.local");
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Wix client
// ---------------------------------------------------------------------------
const client = createClient({
  modules: { items },
  auth: OAuthStrategy({ clientId, clientSecret, siteId }),
});

// ---------------------------------------------------------------------------
// Seed data — 6 Caribbean traveler testimonials
// Fields:
//   name         — traveler name
//   text         — review text (Wix CMS column "Text")
//   avatar       — wix:image:// URI for the avatar photo
//   cover        — wix:image:// URI for the hero cover image
//   date         — ISO date string (month shown in UI)
//   featured     — boolean; featured testimonials appear in the homepage hero
//   tourName     — human-readable tour name (display label)
//   tourRef      — Wix CMS reference to the linked tour _id (optional — set
//                  manually in Wix Content Manager after seeding)
// ---------------------------------------------------------------------------
const SEED_TESTIMONIALS = [
  {
    name: "Sophia & Marcus Laurent",
    text: "Sand Diamonds arranged our entire Barbados honeymoon — from the airport transfer in a vintage Mercedes to a private candlelit dinner on the beach. Every detail was flawless. We've already booked our anniversary trip.",
    avatar:
      "wix:image://v1/11062b_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6~mv2.jpg/avatar-sophia.jpg#originWidth=200&originHeight=200",
    cover:
      "wix:image://v1/11062b_73de9c9d23eb45ad8e0b72b77fde9ce6~mv2.jpg/barbados-beach.jpg#originWidth=1400&originHeight=933",
    date: new Date("2026-02-14").toISOString(),
    featured: true,
    tourName: "Barbados Honeymoon Escape",
    tourRef: null,
  },
  {
    name: "James Okafor",
    text: "I've traveled to Jamaica five times, but this was the first time I truly felt like a local. The private villa in Port Antonio, the waterfall hike with our guide Trevor — unforgettable. Worth every penny.",
    avatar:
      "wix:image://v1/11062b_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7~mv2.jpg/avatar-james.jpg#originWidth=200&originHeight=200",
    cover:
      "wix:image://v1/11062b_73de9c9d23eb45ad8e0b72b77fde9ce6~mv2.jpg/jamaica-waterfall.jpg#originWidth=1400&originHeight=933",
    date: new Date("2026-01-22").toISOString(),
    featured: true,
    tourName: "Jamaica: Beyond the Resorts",
    tourRef: null,
  },
  {
    name: "Priya & Raj Mehta",
    text: "The St Lucia package was beyond our expectations. The Pitons suite, the chocolate massage at the spa, the hot spring hike at dawn — our kids are still talking about it. Sand Diamonds made everything seamless.",
    avatar:
      "wix:image://v1/11062b_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8~mv2.jpg/avatar-priya.jpg#originWidth=200&originHeight=200",
    cover:
      "wix:image://v1/11062b_8d3a1e9c4f2e4e7b8f9a2c4d5e6f7a8b~mv2.jpg/st-lucia-pitons.jpg#originWidth=1400&originHeight=933",
    date: new Date("2025-12-28").toISOString(),
    featured: true,
    tourName: "St Lucia Family Adventure",
    tourRef: null,
  },
  {
    name: "Danielle Moreau",
    text: "I'm a solo traveler and was nervous about a luxury package on my own. The team made me feel completely at home — from the meet-and-greet at Piarco to the farewell rum punch. Trinidad Carnival was electric.",
    avatar:
      "wix:image://v1/11062b_d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9~mv2.jpg/avatar-danielle.jpg#originWidth=200&originHeight=200",
    cover:
      "wix:image://v1/11062b_2c4d6e8f0a1b3c5d7e9f1a2b3c4d5e6f~mv2.jpg/trinidad-carnival.jpg#originWidth=1400&originHeight=933",
    date: new Date("2026-03-03").toISOString(),
    featured: true,
    tourName: "Trinidad Carnival Experience",
    tourRef: null,
  },
  {
    name: "The Williams Family",
    text: "Antigua for a week with four kids and not a single complaint. That's the Sand Diamonds difference. The private catamaran day was the highlight — the kids swam with stingrays. Already saved for next year.",
    avatar:
      "wix:image://v1/11062b_e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0~mv2.jpg/avatar-williams.jpg#originWidth=200&originHeight=200",
    cover:
      "wix:image://v1/11062b_5a0c2f5d0a6b479c9fa6e8de8b88c3ad~mv2.jpg/antigua-catamaran.jpg#originWidth=1400&originHeight=933",
    date: new Date("2025-11-10").toISOString(),
    featured: false,
    tourName: "Antigua Family Luxury Week",
    tourRef: null,
  },
  {
    name: "Omar & Leila Hassan",
    text: "We celebrated our 20th anniversary in Grenada. The spice plantation tour, the dive at the underwater sculpture park, the private chef dinner at the villa — every moment was carefully curated. Simply magical.",
    avatar:
      "wix:image://v1/11062b_f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1~mv2.jpg/avatar-omar.jpg#originWidth=200&originHeight=200",
    cover:
      "wix:image://v1/11062b_a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2~mv2.jpg/grenada-spice.jpg#originWidth=1400&originHeight=933",
    date: new Date("2025-10-05").toISOString(),
    featured: false,
    tourName: "Grenada Anniversary Retreat",
    tourRef: null,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nSeed Wix Testimonials Collection${DRY_RUN ? " (DRY RUN)" : ""}${RESET ? " + RESET" : ""}`);
  console.log(`Site: ${siteId}`);
  console.log(`Collection: ${COLLECTION}\n`);

  // ── Reset: delete all existing items ──────────────────────────────────────
  if (RESET && !DRY_RUN) {
    console.log("Fetching existing testimonials to delete...");
    try {
      const existing = await client.items.query(COLLECTION).find();
      const ids = (existing.items ?? []).map((i) => i._id).filter(Boolean);
      if (ids.length > 0) {
        for (const id of ids) {
          await client.items.remove(COLLECTION, id);
          console.log(`  Deleted: ${id}`);
        }
        console.log(`Deleted ${ids.length} existing testimonial(s).\n`);
      } else {
        console.log("No existing testimonials found.\n");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[warn] Could not fetch/delete existing items: ${msg}\n`);
    }
  }

  // ── Insert ─────────────────────────────────────────────────────────────────
  let inserted = 0;
  let skipped = 0;

  for (const t of SEED_TESTIMONIALS) {
    const item = {
      name: t.name,
      text: t.text,
      avatar: t.avatar,
      cover: t.cover,
      date: t.date,
      featured: t.featured,
      tourName: t.tourName,
      ...(t.tourRef ? { tourRef: t.tourRef } : {}),
    };

    if (DRY_RUN) {
      console.log(`[dry-run] Would insert: "${t.name}" (featured: ${t.featured})`);
      inserted++;
      continue;
    }

    try {
      const result = await client.items.insert(COLLECTION, item);
      console.log(
        `✓ Inserted: "${t.name}" (${result._id}) [featured: ${t.featured}]`,
      );
      inserted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        console.log(`  Skipped (duplicate): "${t.name}"`);
        skipped++;
      } else {
        console.error(`[error] Failed to insert "${t.name}": ${msg}`);
        skipped++;
      }
    }
  }

  console.log(
    `\nDone.\n  ${inserted} testimonial(s) inserted, ${skipped} skipped.`,
  );
  console.log(
    "\n[note] Set tourRef values manually in Wix Content Manager once tours are published.\n",
  );
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
