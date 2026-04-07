// ---------------------------------------------------------------------------
// Ad Interfaces — mirrors the Wix CMS "ads" collection
// Fields: title (Text), mediaGallery (Media Gallery), active (Boolean), cover (Image)
// ---------------------------------------------------------------------------

import type { WixImage } from "./tour";

export interface Ad {
  /** Wix CMS document _id */
  _id: string;
  /** Raw CMS title, e.g. "negril-ads". Use formatAdTitle() for display. */
  title: string;
  /** Primary display image (the "cover" CMS field) */
  cover: WixImage;
  /** Additional gallery images from the "mediaGallery" CMS field */
  mediaGallery: WixImage[];
  /** Whether this ad is currently active (shown to users) */
  active: boolean;
  /** Optional CTA URL — mapped from a "link", "href", or "url" CMS field if present */
  href?: string;
}
