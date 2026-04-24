import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { DesktopShell } from "@/components/layout";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import IOSInstallPrompt from "@/components/pwa/IOSInstallPrompt";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import { AuthProvider } from "@/hooks/useAuth";
import { MockModeProvider } from "@/hooks/useMockMode";
import { TenantProvider } from "@/hooks/useTenant";
import { BRAND } from "@/lib/config/brand";
import { getTenantBranding, brandingToCssVars } from "@/lib/services/branding.service";
import type { TenantContext } from "@/types/tenant";
import "@/styles/globals.css";

// ---------------------------------------------------------------------------
// Fonts — Halis GR (brand sans) + CA Negroni Fill (brand display)
// ---------------------------------------------------------------------------
// Self-hosted via next/font/local for zero layout shift and fastest LCP.
// CSS variables are injected on <html> so Tailwind `font-sans` / `font-display`
// classes work everywhere.
// ---------------------------------------------------------------------------

const halisGR = localFont({
  src: [
    { path: "../fonts/halis-gr/HalisGRThin.ttf", weight: "100", style: "normal" },
    { path: "../fonts/halis-gr/Halis GR-light.otf", weight: "300", style: "normal" },
    { path: "../fonts/halis-gr/HalisGR-Book.otf", weight: "350", style: "normal" },
    { path: "../fonts/halis-gr/HalisGR-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/halis-gr/HalisGR-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/halis-gr/HalisGR-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/halis-gr/HalisGR-Black.otf", weight: "900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-halis",
});

const caNegroni = localFont({
  src: "../fonts/CANegroni-Fill.otf",
  display: "swap",
  variable: "--font-negroni",
  weight: "400",
});

// ---------------------------------------------------------------------------
// SEO — Global Metadata
// ---------------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanddiamonds.travel";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.name,
  },
  title: {
    default: `${BRAND.name} | Bespoke Luxury Concierge`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Handcrafted luxury travel experiences. From Caribbean escapes to " +
    `African safaris — ${BRAND.name} curates bespoke itineraries with ` +
    "concierge-level attention to every detail.",
  keywords: [
    "luxury travel",
    "bespoke travel agency",
    "concierge travel service",
    "premium vacation packages",
    "luxury Caribbean holidays",
    BRAND.name,
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Sand Diamonds Travel",
    title: "Sand Diamonds Travel | Bespoke Luxury Concierge",
    description:
      "Handcrafted luxury travel experiences curated with concierge-level detail.",
    images: [
      {
        url: "/og/default.jpg",
        width: 1200,
        height: 630,
        alt: "Sand Diamonds Travel — Bespoke Luxury Concierge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sand Diamonds Travel | Bespoke Luxury Concierge",
    description:
      "Handcrafted luxury travel experiences curated with concierge-level detail.",
    images: ["/og/default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#076a95",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// ---------------------------------------------------------------------------
// JSON-LD — TravelAgency structured data (site-wide)
// ---------------------------------------------------------------------------

function TravelAgencyJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Sand Diamonds Travel",
    url: siteUrl,
    logo: `${siteUrl}/og/default.jpg`,
    description:
      "Handcrafted luxury travel experiences with concierge-level service.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read tenant context injected by Edge Middleware (SOW §6.2)
  const hdrs = await headers();
  const tenantId = hdrs.get("x-tenant-id") ?? "www";

  // Fetch per-tenant branding from Firestore (SOW §9)
  const branding = await getTenantBranding(tenantId);

  const tenantCtx: TenantContext = {
    tenantId,
    wixSiteId: hdrs.get("x-wix-site-id") ?? process.env.WIX_META_SITE_ID ?? "",
    tenantName: hdrs.get("x-tenant-name") ?? BRAND.name,
    branding,
  };

  const cssVars = brandingToCssVars(branding);

  return (
    <html
      lang="en"
      className={`${halisGR.variable} ${caNegroni.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Favicon and icons: prefer SVG favicon, fall back to PNG assets in /icons */}
        <link rel="icon" href="/favicon.ico" type="image/svg+xml" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" />
        <link rel="icon" href="/icons/icon-512.png" sizes="512x512" />
        <link rel="shortcut icon" href="/file.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        {/* Tenant branding CSS custom properties (SOW §9) */}
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
        {/* Anti-FOUC: apply stored/OS theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('sdtravel-theme');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;var d=s!==null?s==='dark':p;if(d){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','sanddiamonds-dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-stone-500 font-sans text-ocean-deep antialiased transition-colors duration-300 dark:bg-ocean-deep dark:text-white">
        <OfflineBanner />
        <TravelAgencyJsonLd />
        <TenantProvider value={tenantCtx}>
          <AuthProvider>
            <MockModeProvider>
              {/* Desktop: sidebar shell (hidden on mobile via internal CSS) */}
              {/* Mobile: children render directly, shell passthroughs */}
              <DesktopShell>
                {children}
              </DesktopShell>
              {/* Mobile only: bottom nav + iOS install prompt */}
              <div className="md:hidden">
                <MobileBottomNav />
                <IOSInstallPrompt />
              </div>
            </MockModeProvider>
          </AuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
