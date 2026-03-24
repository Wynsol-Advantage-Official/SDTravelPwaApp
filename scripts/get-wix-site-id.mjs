// Run: node scripts/get-wix-site-id.mjs
// Lists all Wix sites for this account so you can find the correct WIX_SITE_ID.
import { readFileSync } from "fs";

// Load .env.local
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"(.*)"$/, "$1")];
    }),
);

const apiKey = env.WIX_API_KEY;
const accountId = env.WIX_ACCOUNT_ID;

if (!apiKey || !accountId) {
  console.error("Missing WIX_API_KEY or WIX_ACCOUNT_ID in .env.local");
  process.exit(1);
}

const r = await fetch("https://www.wixapis.com/site-list/v2/sites", {
  headers: { Authorization: apiKey, "wix-account-id": accountId },
});
console.log("HTTP status:", r.status);
const text = await r.text();
let d;
try { d = JSON.parse(text); } catch { console.error("Non-JSON response:", text.slice(0, 500)); process.exit(1); }
const sites = d.sites || [];

if (sites.length) {
  console.log("Sites on this Wix account:\n");
  sites.forEach((s) =>
    console.log(`  ${s.displayName || "(no name)"}\n  ID: ${s.id}\n  URL: ${s.url || ""}\n`),
  );
  console.log(`Set WIX_SITE_ID= in .env.local to the ID of your Sand Diamonds site.`);
} else {
  console.log("No sites found. Raw response:");
  console.log(JSON.stringify(d, null, 2));
}
