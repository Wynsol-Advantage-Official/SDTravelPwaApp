// ---------------------------------------------------------------------------
// Formatting Utilities
// ---------------------------------------------------------------------------

/**
 * Format a price with currency symbol and locale-aware separators.
 */
export function formatPrice(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date range for display: "Mar 12 – 19, 2026"
 */
export function formatDateRange(
  start: Date,
  end: Date,
  locale = "en-US"
): string {
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const month = start.toLocaleDateString(locale, { month: "short" });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();
    return `${month} ${startDay} – ${endDay}, ${year}`;
  }

  const fmt = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/**
 * Create a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
