#!/usr/bin/env node
// ---------------------------------------------------------------------------
// seed-wix-articles.mjs — Seed the Wix CMS "Articles" collection
// ---------------------------------------------------------------------------
// Creates sample travel articles in the www tenant's Wix site.
// The Articles collection is created automatically on first insert by Wix Data.
//
// Usage:
//   node scripts/seed-wix-articles.mjs              # insert seed articles
//   node scripts/seed-wix-articles.mjs --dry-run    # preview without writing
//   node scripts/seed-wix-articles.mjs --reset      # delete existing + re-insert
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
const ARTICLES_COLLECTION = "Articles";

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
// Seed data — 4 Caribbean travel articles
// ---------------------------------------------------------------------------
const SEED_ARTICLES = [
  {
    title: "Insider's Guide to Jamaica: Hidden Gems Beyond the Resorts",
    slug: "insiders-guide-jamaica-hidden-gems",
    excerpt:
      "From the Blue Mountains to the south coast's untouched beaches, discover the Jamaica that most tourists never see.",
    category: "Insider Guide",
    author: "Camille Rowe",
    publishedDate: new Date("2026-03-15").toISOString(),
    readMinutes: 7,
    active: true,
    link: "/blog/insiders-guide-jamaica-hidden-gems",
    coverImage:
      "wix:image://v1/11062b_73de9c9d23eb45ad8e0b72b77fde9ce6~mv2.jpg/jamaica-blue-mountains.jpg#originWidth=1400&originHeight=933",
  },
  {
    title: "Romantic Things to Do in Barbados: The Couple's Playbook",
    slug: "romantic-things-to-do-barbados",
    excerpt:
      "Sunset catamaran cruises, private coves, and candlelit cliff-top dinners — Barbados is made for romance.",
    category: "Things To Do",
    author: "Marcus Hennessy",
    publishedDate: new Date("2026-02-28").toISOString(),
    readMinutes: 5,
    active: true,
    link: "/blog/romantic-things-to-do-barbados",
    coverImage:
      "wix:image://v1/11062b_5a0c2f5d0a6b479c9fa6e8de8b88c3ad~mv2.jpg/barbados-sunset.jpg#originWidth=1400&originHeight=933",
  },
  {
    title: "St Lucia in 5 Days: The Perfect First-Timer's Itinerary",
    slug: "st-lucia-5-day-itinerary",
    excerpt:
      "Iconic Pitons, volcanic mud baths, and rainforest canopy walks — here's how to pack it all in without missing a beat.",
    category: "Itineraries",
    author: "Olivia Marsh",
    publishedDate: new Date("2026-01-20").toISOString(),
    readMinutes: 6,
    active: true,
    link: "/blog/st-lucia-5-day-itinerary",
    coverImage:
      "wix:image://v1/11062b_8d3a1e9c4f2e4e7b8f9a2c4d5e6f7a8b~mv2.jpg/st-lucia-pitons.jpg#originWidth=1400&originHeight=933",
  },
  {
    title: "Trinidad Carnival: How to Experience the World's Greatest Party",
    slug: "trinidad-carnival-guide",
    excerpt:
      "Steel pan rhythms, soca music, and a million revellers in the streets. Our complete guide to planning your Carnival trip.",
    category: "Events & Culture",
    author: "Jerome Baptiste",
    publishedDate: new Date("2026-01-05").toISOString(),
    readMinutes: 8,
    active: true,
    link: "/blog/trinidad-carnival-guide",
    coverImage:
      "wix:image://v1/11062b_2c4d6e8f0a1b3c5d7e9f1a2b3c4d5e6f~mv2.jpg/trinidad-carnival.jpg#originWidth=1400&originHeight=933",
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nSeed Wix Articles Collection${DRY_RUN ? " (DRY RUN)" : ""}${RESET ? " + RESET" : ""}`);
  console.log(`Site: ${siteId}`);
  console.log(`Collection: ${ARTICLES_COLLECTION}\n`);

  // ── Reset: delete all existing items ──────────────────────────────────────
  if (RESET && !DRY_RUN) {
    console.log("Fetching existing articles to delete...");
    try {
      const existing = await client.items.query(ARTICLES_COLLECTION).find();
      const ids = (existing.items ?? []).map((i) => i._id).filter(Boolean);
      if (ids.length > 0) {
        for (const id of ids) {
          await client.items.remove(ARTICLES_COLLECTION, id);
          console.log(`  Deleted: ${id}`);
        }
        console.log(`Deleted ${ids.length} existing article(s).\n`);
      } else {
        console.log("No existing articles found.\n");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Collection not found is expected on first run — not fatal
      if (msg.includes("not found") || msg.includes("doesn't exist")) {
        console.log("Collection does not exist yet — skipping reset.\n");
      } else {
        console.error("[error] Reset failed:", msg);
        process.exit(1);
      }
    }
  }

  // ── Insert seed articles ───────────────────────────────────────────────────
  let inserted = 0;
  let skipped = 0;

  for (const article of SEED_ARTICLES) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would insert: "${article.title}"`);
      console.log(`  slug: ${article.slug}`);
      console.log(`  category: ${article.category}`);
      console.log(`  author: ${article.author}`);
      console.log(`  readMinutes: ${article.readMinutes}`);
      console.log();
      skipped++;
      continue;
    }

    try {
      const result = await client.items.insert(ARTICLES_COLLECTION, article);
      console.log(`✓ Inserted: "${article.title}" (${result._id})`);
      inserted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Slug already exists — skip gracefully
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        console.log(`  Skipped (already exists): "${article.title}"`);
        skipped++;
      } else {
        console.error(`[error] Failed to insert "${article.title}":`, msg);
      }
    }
  }

  console.log(`\nDone.`);
  if (DRY_RUN) {
    console.log(`  ${skipped} article(s) would be inserted (dry run).`);
  } else {
    console.log(`  ${inserted} article(s) inserted, ${skipped} skipped.\n`);
  }
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
