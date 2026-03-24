import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import IOSInstallPrompt from "@/components/pwa/IOSInstallPrompt";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import { AuthProvider } from "@/hooks/useAuth";
import { MockModeProvider } from "@/hooks/useMockMode";
import "@/styles/globals.css";

// ---------------------------------------------------------------------------
// Fonts — Premium Serif + Clean Sans-Serif
// ---------------------------------------------------------------------------
// Self-hosted via next/font for zero layout shift and fastest LCP.
// CSS variables are injected on <html> so Tailwind `font-serif` / `font-sans`
// classes work everywhere.
// ---------------------------------------------------------------------------

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

// ---------------------------------------------------------------------------
// SEO — Global Metadata
// ---------------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanddiamondstravel.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sand Diamonds",
  },
  title: {
    default: "Sand Diamonds Travel | Bespoke Luxury Concierge",
    template: "%s | Sand Diamonds Travel",
  },
  description:
    "Handcrafted luxury travel experiences. From Caribbean escapes to " +
    "African safaris — Sand Diamonds curates bespoke itineraries with " +
    "concierge-level attention to every detail.",
  keywords: [
    "luxury travel",
    "bespoke travel agency",
    "concierge travel service",
    "premium vacation packages",
    "luxury Caribbean holidays",
    "Sand Diamonds Travel",
  ],
  authors: [{ name: "Sand Diamonds Travel" }],
  creator: "Sand Diamonds Travel",
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
  themeColor: "#D4AF37",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="bg-diamond font-sans text-charcoal antialiased">
        <OfflineBanner />
        <TravelAgencyJsonLd />
        <AuthProvider>
          <MockModeProvider>
            {/* Desktop: show Header; Mobile: hidden */}
            <div className="hidden md:block">
              <Header />
            </div>
            {/* Desktop: pad for fixed header; Mobile: pad for bottom nav */}
            <div className="pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0 md:pt-16">
              {children}
            </div>
            {/* Desktop: show Footer; Mobile: hidden */}
            <div className="hidden md:block">
              <Footer />
            </div>
            {/* Mobile only: bottom nav + iOS install prompt */}
            <div className="md:hidden">
              <MobileBottomNav />
              <IOSInstallPrompt />
            </div>
          </MockModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
