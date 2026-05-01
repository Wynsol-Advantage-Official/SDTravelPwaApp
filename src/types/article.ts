// ---------------------------------------------------------------------------
// Article Interface — mirrors the Wix CMS "Articles" collection
// Fields: title, slug, excerpt, category, coverImage, author,
//         publishedDate, readMinutes, active, link
// ---------------------------------------------------------------------------

import type { WixImage } from "./tour";

export interface Article {
  /** Wix CMS document _id */
  _id: string;
  /** Article headline */
  title: string;
  /** URL-safe slug, e.g. "insiders-guide-to-jamaica" */
  slug: string;
  /** Short description / lede — 1–2 sentences */
  excerpt: string | null;
  /** Editorial category label, e.g. "Things To Do", "Insider Guide" */
  category: string | null;
  /** Primary cover image */
  cover: WixImage;
  /** Byline name */
  author: string | null;
  /** ISO 8601 date string from Wix CMS, e.g. "2026-04-30T00:00:00.000Z" */
  publishedDate: string | null;
  /** Estimated read time in minutes */
  readMinutes: number | null;
  /** Whether this article is published and visible to users */
  active: boolean;
  /** Optional CTA URL override — falls back to /blog/[slug] if absent */
  href?: string;
}
