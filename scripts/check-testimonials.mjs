#!/usr/bin/env node
// Quick diagnostic: query Wix Testimonials using ApiKeyStrategy (elevated perms)
import { createClient, OAuthStrategy, ApiKeyStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t[0] === "#") continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

const { WIX_CLIENT_ID, WIX_CLIENT_SECRET, WIX_META_SITE_ID, WIX_API_KEY, WIX_ACCOUNT_ID } = process.env;
if (!WIX_CLIENT_ID) { console.error("[error] WIX_CLIENT_ID not set"); process.exit(1); }

// Use ApiKeyStrategy (elevated) if available, otherwise fall back to OAuth
const auth = WIX_API_KEY && WIX_ACCOUNT_ID
  ? ApiKeyStrategy({ apiKey: WIX_API_KEY, accountId: WIX_ACCOUNT_ID, ...(WIX_META_SITE_ID ? { siteId: WIX_META_SITE_ID } : {}) })
  : OAuthStrategy({ clientId: WIX_CLIENT_ID, ...(WIX_CLIENT_SECRET ? { clientSecret: WIX_CLIENT_SECRET } : {}), ...(WIX_META_SITE_ID ? { siteId: WIX_META_SITE_ID } : {}) });

console.log(`Using: ${WIX_API_KEY ? "ApiKeyStrategy (elevated)" : "OAuthStrategy"}`);

const client = createClient({ modules: { items }, auth });

try {
  const res = await client.items.query("Testimonials").limit(20).find();
  const allItems = res.items ?? [];
  console.log(`\nTotal Testimonials returned: ${allItems.length}`);

  if (allItems.length === 0) {
    console.log("No items — possible permissions issue or wrong collection name");
  } else {
    console.log("\nField keys on first item:", Object.keys(allItems[0]));
    for (const item of allItems) {
      const name = item.name ?? "(no name)";
      const quote = item.text ?? item.Text ?? item.quote ?? "(no text/quote)";
      const featured = item.featured;
      const hasCover = !!(item.cover || item.coverImage);
      console.log(`  [${featured ? "featured" : "standard"}] ${name} | quote: "${String(quote).slice(0,50)}..." | cover: ${hasCover}`);
    }
  }
} catch (err) {
  console.error("[error] Query failed:", err.message ?? err);
}
