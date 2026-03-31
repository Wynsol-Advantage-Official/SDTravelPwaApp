# SD Travel PWA — Luxury Concierge Travel Booking Platform

**"Where Every Journey Becomes a Diamond"** — A premium, modern PWA for booking bespoke luxury travel experiences with real-time concierge support and offline-first functionality.

## Features

- **Muted Video Hero with Parallax** — Premium homepage visual design with cinematic background video, fallback to static poster, and conservative parallax transitions for depth without performance impact.
- **Accessibility-First Motion** — All parallax and animated effects respect `prefers-reduced-motion` preference; content remains fully readable and navigable without motion.
- **Testimonials & Social Proof** — Homepage includes trust-building testimonial cards with required/optional fields and responsive layout across all device sizes.
- **Partner Logos Section** — Responsive partner credibility band with normalized logo aspect ratios and graceful fallback for missing assets.
- **Real-time Chat & Concierge** — In-app messaging for clients to connect with concierge team, with offline persistence via Firebase.
- **Booking Management** — Create, track, and manage reservations with full itinerary details and policy information.
- **Saved Experiences** — Bookmark favorite tours and destinations ("Saved Diamonds") for later exploration.
- **User Profiles** — Personalized settings, travel preferences, and saved payment methods stored securely via Firebase Auth.
- **PWA Capabilities** — Installable on mobile/desktop, works offline, background sync, and home screen shortcuts via `@ducanh2912/next-pwa`.
- **SEO & Performance** — Server-rendered layouts, ISR caching, image optimization, and lazy loading for Lighthouse-friendly scores.

## Requirements

### Node.js Runtime
- **Node.js**: 18.17+ (LTS recommended)
- **npm**: 9+ or yarn 4+

### Environment Variables
Create a `.env.local` file in the project root:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>

# Wix (if eCommerce integration enabled)
WIX_API_KEY=<your-wix-api-key>
WIX_SITE_ID=<your-wix-site-id>

# Optional: Mock mode for development/testing
NEXT_PUBLIC_MOCK_MODE=false
```

### External Services
- **Firebase Project** (Authentication, Firestore, Cloud Storage)
- **Wix CMS** (optional, for tours and eCommerce data)

### Toolchain
- TypeScript v5+
- Tailwind CSS v4 (note: breaking changes from v3)
- Next.js 15 App Router
- React 19
- Jest for testing
- Framer Motion for animations

## Quickstart

### 1. Clone and install
```bash
git clone https://github.com/wynsoladvantage/SDTravelPwaApp.git
cd SDTravelPwaApp
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase and Wix credentials
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The page auto-refreshes as you edit `src/app/` files.

### 4. Build for production
```bash
npm run build
npm start
```

## Scripts

| Command        | Purpose |
|---|---|
| `npm run dev`  | Start development server (localhost:3000) with hot reload |
| `npm run build` | Compile TypeScript, optimize assets, create production bundle |
| `npm start`    | Run production server (requires prior `npm run build`) |
| `npm test`     | Run Jest test suite in watch mode |
| `npm run test:ci` | Run Jest once (for CI pipelines) |
| `npm run lint` | Check TypeScript and ESLint rules (if configured) |

## Project Structure

```
src/
├── app/                          # Next.js App Router pages & layouts
│   ├── page.tsx                 # Homepage (hero with video, testimonials, logos)
│   ├── layout.tsx               # Root layout wrapper
│   ├── auth/                    # Authentication pages (sign-in, sign-up)
│   ├── booking/                 # Booking flow and details
│   ├── dashboard/               # User dashboard (chat, bookings, profile)
│   ├── tours/                   # Tour catalog and detail pages
│   ├── destinations/            # Destination guides and regional pages
│   ├── my-bookings/             # User's active and past bookings
│   └── api/                     # API route handlers (webhooks, proxy)
│
├── components/                   # Reusable React components
│   ├── sections/                # Homepage sections (HeroVideoParallax, TestimonialsSection, etc.)
│   ├── dashboard/               # Dashboard UI components
│   ├── booking/                 # Booking form and card components
│   ├── auth/                    # Authentication guard and sign-in form
│   ├── layout/                  # Header, Footer, Navigation
│   └── ui/                      # Generic UI primitives (buttons, modals, etc.)
│
├── hooks/                        # React hooks (state + service calls)
│   ├── useAuth.tsx              # Auth state and user context
│   ├── useChat.ts               # Chat messaging
│   ├── useBooking.ts            # Booking operations
│   └── useMockMode.tsx          # Toggle mock vs live data
│
├── lib/                          # Business logic & utilities
│   ├── services/                # Service layer (wraps Firebase, Wix)
│   ├── firebase/                # Firebase client config
│   ├── wix/                     # Wix SDK wrappers
│   ├── rules/                   # Pure business logic (no async)
│   ├── utils/                   # Helper functions
│   └── config/                  # Configuration constants
│
├── types/                        # TypeScript domain types
│   ├── tour.ts                  # Tour, Destination, Itinerary types
│   ├── booking.ts               # Booking, Payment types
│   ├── user.ts                  # UserProfile, Preferences types
│   ├── chat.ts                  # ChatMessage, Conversation types
│   └── homepage.ts              # Homepage content (testimonials, logos)
│
├── mocks/                        # Mock data for development
│   ├── tours.ts                 # Sample tour listings
│   ├── bookings.ts              # Sample bookings
│   ├── chat.ts                  # Sample messages
│   └── homepage.ts              # Sample testimonials, logos
│
└── styles/
    └── globals.css              # Global Tailwind v4 styles & theme tokens
```

## Homepage Redesign — Behavior & Validation

### Overview
The homepage (2026-03-31 session) was redesigned with a premium visual direction: muted cinematic video hero, conservative parallax transitions, testimonials for social proof, and partner logos for credibility.

### Key Sections

#### 1. HeroVideoParallax
- **Background**: Muted, looped video with autoplay intent
- **Fallback**: Automatically displays static poster image on autoplay block or media failure
- **Content**: Readable headline + 2 call-to-action buttons (gold primary, outline secondary)
- **Overlay**: Gradient scrim to ensure WCAG AA contrast over multiple video scenes
- **Motion**: Low-intensity parallax on desktop; reduced on mobile; disabled for `prefers-reduced-motion`

#### 2. ParallaxBand
- **Lightweight transition section** between content blocks with transform-only scroll motion
- **Reduced-motion gating**: Automatically disables parallax when user prefers reduced motion
- **Mobile optimization**: Reduces intensity or disables entirely to maintain smooth scrolling

#### 3. TestimonialsSection
- **Responsive grid**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- **Required fields**: Quote + person name
- **Optional fields**: Role and location (hidden if empty)
- **Minimum 3 testimonials** with proper text wrapping and card depth

#### 4. PartnerLogosSection
- **Responsive logo grid**: 2 columns (mobile) → 3-4 (tablet) → 5-6 (desktop)
- **Aspect-ratio normalization**: Fixed-height containers prevent logo stretching
- **Fallback handling**: Missing images fall back to brand-name text shell
- **Semantic alt text** for all logo images

### Accessibility Notes

✓ **Reduced-motion respect**
- All parallax effects respect `prefers-reduced-motion: reduce`
- When enabled, parallax disables or minimizes; all content remains fully functional
- Test: DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion: reduce

✓ **Color contrast**
- Hero text maintains WCAG AA minimum contrast over multiple video scene samples
- Focus rings use on-brand gold outline (`focus-visible:ring-2 focus-visible:ring-gold`)

✓ **Semantic HTML & keyboard navigation**
- Heading hierarchy preserved (one `h1`, multiple section `h2`s)
- All interactive controls are keyboard focusable with visible focus states
- Tab order follows visual left-to-right, top-to-bottom layout

✓ **Inclusive media**
- Video is decorative; primary content is readable text + CTAs
- Fallback ensures full experience on autoplay-blocked browsers or low-bandwidth conditions

### Performance Notes

✓ **Media optimization**
- Hero video compresses to <2MB; poster image optimized as WebP/JPG
- Video does not block initial render; poster displays immediately on network delay
- No heavy filters or stacked blend modes on video layer

✓ **Animation performance**
- Parallax uses transform and opacity only (GPU-accelerated)
- No expensive scroll-linked blur or filter effects
- Motion reduces on low-end devices via capability detection

✓ **Core Web Vitals**
- First Contentful Paint (FCP): <3s on 4G
- Largest Contentful Paint (LCP): <4s
- Cumulative Layout Shift (CLS): 0 in hero and testimonials sections

### Validation Commands

#### Automated Tests
```bash
# Run Jest test suite
npm test

# Expected output:
# ✓ 4 test suites passed
# ✓ 12+ tests passed
# Coverage: hero fallback behavior, parallax reduced-motion gating, testimonials rendering, logos grid
```

#### Build Verification
```bash
npm run build

# Expected output:
# ✓ npm ERR! code 0 (success)
# ✓ Next.js production build completed
# ✓ No TypeScript errors
# ✓ All homepage sections compiled and optimized
```

#### Manual Validation (Desktop, http://localhost:3000)

**Visual checks:**
1. Hero displays muted background video with readable headline + CTAs
2. On page load, video attempts autoplay (muted)
3. Content text remains legible over multiple video scenes
4. Testimonials section displays 3+ cards with quote + name
5. Partner logos grid displays aligned brands without stretching
6. Parallax effect visible when scrolling through sections
7. No cumulative layout shift (CLS) during transitions

**Accessibility checks:**
1. Enable DevTools → Rendering → Emulate prefers-reduced-motion: reduce
   - ✓ Parallax effect is disabled or significantly reduced
   - ✓ All text remains fully readable
2. Press Tab through page and verify visible gold focus rings on all CTAs
3. Verify tab order follows visual layout (left-to-right, top-to-bottom)

**Video fallback (autoplay blocked):**
1. DevTools → Settings → Autoplay → Block all
2. Reload page
   - ✓ Hero displays static poster immediately (no blank flash)
   - ✓ Headline, subheading, CTAs all visible
   - ✓ CTAs navigate to `/tours` and `/dashboard/chat` correctly

**Responsive validation:**
- **Mobile (375px)**: Hero headline wraps 2-3 lines, CTAs stack, testimonials 1 column, logos 2 columns
- **Tablet (768px)**: Testimonials 2 columns, logos 3-4 columns, moderate parallax
- **Desktop (1440px)**: Testimonials 3-column grid, logos 5-6 columns, full parallax intensity

**Performance audit (Lighthouse):**
```bash
npm run dev
# Open http://localhost:3000 in Chrome
# DevTools → Lighthouse → Generate report
# Expected: Performance score ≥ baseline (no >5% regression)
# First Contentful Paint: <3s on 4G
# Largest Contentful Paint: <4s
# Cumulative Layout Shift: <0.1 in hero section
```

## Troubleshooting

### Build errors
**Problem**: `npm run build` fails with TypeScript errors
- **Solution**: Run `npm install` to ensure all dependencies are up to date. Check `tsconfig.json` for `strict: true` mode enforcement.

### Hero video not playing
**Problem**: Hero video displays blank on load, then poster appears
- **Expected behavior**: This is normal autoplay blocking. Fallback to poster is intentional.
- **Check**: Verify `public/media/home-hero.mp4` exists and network is not throttled.

### Parallax motion looks janky on mobile
**Problem**: Scrolling feels sluggish with parallax enabled
- **Solution**: The component automatically reduces parallax intensity on mobile. If still janky:
  1. Check DevTools Performance tab for long tasks during scroll
  2. Verify device GPU is not throttled (disable in DevTools)
  3. Consider enabling `prefers-reduced-motion` to fully disable parallax for testing

### Test failures
**Problem**: `npm test` fails with "act(...)" warnings
- **Solution**: Warnings are non-blocking. Verify test output still shows PASS. If tests fail:
  1. Run `npm install` to sync dependencies
  2. Clear Jest cache: `npm test -- --clearCache`
  3. Check `jest.config.mjs` for jsdom environment configuration

### Firebase connection errors
**Problem**: "Error: Failed to initialize Firebase" on page load
- **Solution**: 
  1. Verify `.env.local` contains all required Firebase keys
  2. Check Firebase project is active and rules allow public read (if not authenticated)
  3. Verify network connectivity (DevTools Network tab)

## License

Proprietary — SD Travel / Wynsol Advantage. All rights reserved. See LICENSE.md for details (if applicable).
