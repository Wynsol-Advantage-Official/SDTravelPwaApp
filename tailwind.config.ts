import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── Brand Book Palette ──────────────────────────────────────── */
        tan: {
          DEFAULT: "#f2e2bf",
          50: "#fefcf6",
          100: "#fdf8eb",
          200: "#f9efd5",
          300: "#f2e2bf",
          400: "#e8cc8f",
          500: "#d5b060",
          600: "#b8903a",
          700: "#8c6e2d",
          800: "#604c20",
          900: "#342a12",
        },
        khaki: {
          DEFAULT: "#f1d3b2",
          50: "#fef9f3",
          100: "#fdf2e6",
          200: "#f8e2cc",
          300: "#f1d3b2",
          400: "#e5b380",
          500: "#d48f4e",
          600: "#b5722e",
          700: "#885524",
          800: "#5c3a19",
          900: "#301f0e",
        },
        "blue-chill": {
          DEFAULT: "#1282a5",
          50: "#e6f4f8",
          100: "#c0e3ef",
          200: "#80c7df",
          300: "#40abcf",
          400: "#1a96ba",
          500: "#1282a5",
          600: "#0e6884",
          700: "#0b4e63",
          800: "#073442",
          900: "#041a21",
        },
        ocean: {
          DEFAULT: "#076a95",
          50: "#e5f2f8",
          100: "#bddeed",
          200: "#7abddb",
          300: "#389cc9",
          400: "#0f83af",
          500: "#076a95",
          600: "#065577",
          700: "#044059",
          800: "#032b3c",
          900: "#01151e",
          /* Dark theme surfaces derived from Ocean */
          deep: "#043750",
          card: "#05476a",
          card2: "#065882",
        },
        /* Semantic aliases for backward compat during migration */
        sand: { DEFAULT: "#f2e2bf" },        /* maps to tan */
        gold: { DEFAULT: "#076a95" },        /* maps to ocean */
        diamond: { DEFAULT: "#ffffff" },     /* maps to white */
        charcoal: { DEFAULT: "#043750" },    /* maps to ocean-deep */
        luxury: {
          base: "#043750",                   /* ocean deep */
          card: "#05476a",                   /* ocean card */
          card2: "#065882",                  /* ocean card2 */
          card3: "#04304a",                  /* darker ocean */
        },
        luxgold: {
          DEFAULT: "#1282a5",               /* blue-chill */
          light: "#40abcf",                 /* blue-chill-300 */
          dim: "rgba(18,130,165,0.15)",     /* blue-chill dim */
        },
        luxtext: {
          DEFAULT: "#ffffff",               /* white */
          muted: "#bddeed",                /* ocean-100 */
          subtle: "#7abddb",               /* ocean-200 */
        },
        luxborder: {
          DEFAULT: "rgba(255,255,255,0.10)",
          gold: "rgba(18,130,165,0.30)",    /* blue-chill accent */
        },
      },
      fontFamily: {
        sans: ["var(--font-halis)", "Halis GR", "system-ui", "sans-serif"],
        display: ["var(--font-negroni)", "CA Negroni Fill", "serif"],
        serif: ["var(--font-halis)", "Halis GR", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "fade-slide": "fadeSlide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "fade-up": "fadeUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeSlide: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
