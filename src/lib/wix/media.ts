// ---------------------------------------------------------------------------
// Wix Image URL Helpers
// ---------------------------------------------------------------------------
// Wix stores images as `wix:image://v1/<fileId>/<filename>#originWidth=W&originHeight=H`
// This module converts those references into optimized CDN URLs.
// ---------------------------------------------------------------------------

const WIX_MEDIA_BASE = "https://static.wixstatic.com/media";

/**
 * Convert a Wix image URI to a CDN URL with optional transforms.
 *
 * @param wixImageSrc - The `src` from a Wix image field (can be wix:image:// or plain URL)
 * @param options - Resize/quality options for the Wix image CDN
 */
export function getWixImageUrl(
  wixImageSrc: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  if (!wixImageSrc) return "/og/default.jpg";

  // Already a full URL (e.g., from a media manager direct link)
  if (wixImageSrc.startsWith("http")) return wixImageSrc;

  // Extract fileId from wix:image://v1/<fileId>/<filename>#originWidth=...
  const match = wixImageSrc.match(/wix:image:\/\/v1\/([^/]+)/);
  const fileId = match ? match[1] : wixImageSrc;

  let url = `${WIX_MEDIA_BASE}/${fileId}`;

  // Apply image transforms via Wix Image API
  // Wix fill endpoint requires both w and h to be non-zero.
  if (options?.width || options?.height) {
    const w = options.width ?? options.height!;
    const h = options.height ?? options.width!;
    const q = options.quality ?? 80;
    url += `/v1/fill/w_${w},h_${h},q_${q},usm_0.66_1.00_0.01/image.webp`;
  }

  return url;
}

/**
 * Extract original dimensions from a `wix:image://` URI.
 */
export function getWixImageDimensions(wixImageSrc: string): {
  width: number;
  height: number;
} {
  const widthMatch = wixImageSrc.match(/originWidth=(\d+)/);
  const heightMatch = wixImageSrc.match(/originHeight=(\d+)/);

  return {
    width: widthMatch ? parseInt(widthMatch[1], 10) : 1200,
    height: heightMatch ? parseInt(heightMatch[1], 10) : 675,
  };
}
