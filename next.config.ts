import type { NextConfig } from "next"
import withPWA from "@ducanh2912/next-pwa"

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow Turbopack to coexist with PWA webpack plugin
  turbopack: {},

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "*.wixstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  // Server-only packages — never bundle into client
  serverExternalPackages: ["firebase-admin"],
}

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,

  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,

    runtimeCaching: [
      // ── Wix CDN media assets ─────────────────────────────────────────────
      {
        urlPattern: /^https:\/\/static\.wixstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "wix-media-cache",
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },

      // ── Unsplash images ──────────────────────────────────────────────────
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "unsplash-media-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },

      // ── Booking detail API (GET only — excludes mutation routes) ─────────
      {
        urlPattern: /\/api\/bookings\/(?!initiate|update-status|admin-list|resolve-heroes)[^/]+$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "booking-detail-cache",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
        },
      },

      // ── Next.js static chunks (JS, CSS) ──────────────────────────────────
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },

      // ── Google Fonts ─────────────────────────────────────────────────────
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
          },
        },
      },
    ],
  },
})(nextConfig)
