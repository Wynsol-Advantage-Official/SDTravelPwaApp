// ---------------------------------------------------------------------------
// Articles Business Rules (pure — no async, no external imports)
// ---------------------------------------------------------------------------

import type { Article } from "@/types/article";

/**
 * Filter to active articles and limit to `max` items for display.
 * Preserves the original ordering from the CMS.
 */
export function selectArticlesToDisplay(articles: Article[], max: number): Article[] {
  return articles.filter((a) => a.active).slice(0, max);
}

/**
 * Format an ISO date string into a human-readable display string.
 *
 * Examples:
 *   "2026-04-30T00:00:00.000Z" → "Apr 30, 2026"
 *   null                       → ""
 */
export function formatArticleDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/**
 * Build a resolved href for an article.
 * Falls back to /blog/[slug] if no explicit CMS link is set.
 */
export function getArticleHref(article: Article): string {
  return article.href ?? `/blog/${article.slug}`;
}
