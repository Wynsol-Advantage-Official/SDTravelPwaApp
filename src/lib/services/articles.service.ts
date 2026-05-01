// ---------------------------------------------------------------------------
// Articles Service — orchestrates Wix data access for articles
// ---------------------------------------------------------------------------
// This is the only file hooks/pages should import for article data.
// All Wix calls are encapsulated in @/lib/wix/articles.
// ---------------------------------------------------------------------------

import { getArticles } from "@/lib/wix/articles";
import { selectArticlesToDisplay } from "@/lib/rules/articles-rules";
import type { Article } from "@/types/article";

/**
 * Fetch active articles for display, limited to `max` items.
 * Applies active-only filter at the service + rules layer.
 * Returns an empty array on failure — callers should render a null/empty state.
 *
 * @param max - Maximum number of articles to return (default 6)
 */
export async function getActiveArticles(max = 6): Promise<Article[]> {
  // Fetch slightly more than needed so the rules layer can filter any
  // inactive items that slipped through a Wix query cache.
  const articles = await getArticles({ activeOnly: true, limit: max * 2 });
  return selectArticlesToDisplay(articles, max);
}
