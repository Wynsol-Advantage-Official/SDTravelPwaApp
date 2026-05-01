// ---------------------------------------------------------------------------
// Contact Widget types
// ---------------------------------------------------------------------------

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "youtube"
  | "linkedin";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

/** Resolved contact information for the current tenant, derived from TenantBranding. */
export interface ContactInfo {
  tenantName: string;
  /** E.164 or raw phone string — used for tel: links */
  phone: string | null;
  /** Digits only (stripped) — used for wa.me/ URLs */
  whatsappNumber: string | null;
  email: string | null;
  social: SocialLink[];
}
