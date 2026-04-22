export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Sand Diamonds Travel",
  logo: process.env.NEXT_PUBLIC_BRAND_LOGO ?? "/logos/brand/full_colour.svg",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Curated luxury travel experiences",
  supportEmail: process.env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL ?? "support@sanddiamondstravel.com",
  phone: process.env.NEXT_PUBLIC_BRAND_PHONE ?? "+1 876 276-7352",
} as const
