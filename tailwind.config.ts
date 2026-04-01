import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          DEFAULT: "#C2A978",
          50: "#F7F3EC",
          100: "#EDE5D6",
          200: "#DCC9AB",
          300: "#C2A978",
          400: "#B29558",
          500: "#9A7D42",
          600: "#7A6335",
          700: "#5A4927",
          800: "#3B301A",
          900: "#1D180D",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF5E0",
          100: "#F5E8B8",
          200: "#ECDA8F",
          300: "#D4AF37",
          400: "#C9A020",
          500: "#A8860F",
          600: "#86690C",
          700: "#644E09",
          800: "#423406",
          900: "#211A03",
        },
        ocean: {
          DEFAULT: "#006994",
          50: "#E0F2F8",
          100: "#B3E0EF",
          200: "#66C1DE",
          300: "#1A9FC8",
          400: "#0083AE",
          500: "#006994",
          600: "#005577",
          700: "#00405A",
          800: "#002B3D",
          900: "#001520",
        },
        diamond: {
          DEFAULT: "#F5F5F0",
          50: "#FFFFFF",
          100: "#FAFAF8",
          200: "#F5F5F0",
          300: "#E8E8DF",
          400: "#D4D4C8",
          500: "#B0B0A0",
          600: "#8C8C78",
          700: "#686858",
          800: "#444438",
          900: "#22221C",
        },
        charcoal: {
          DEFAULT: "#1A1A2E",
          50: "#E8E8EC",
          100: "#C4C4CF",
          200: "#8E8EA4",
          300: "#585878",
          400: "#363653",
          500: "#1A1A2E",
          600: "#151527",
          700: "#10101F",
          800: "#0B0B17",
          900: "#06060C",
        },
        luxury: {
          base: "#0D0D0D",
          card: "#141414",
          card2: "#1A1A1A",
          card3: "#111111",
        },
        luxgold: {
          DEFAULT: "#C9A84C",
          light: "#E4C97E",
          dim: "rgba(201,168,76,0.15)",
        },
        luxtext: {
          DEFAULT: "#F0EDE6",
          muted: "#7A7570",
          subtle: "#4A4540",
        },
        luxborder: {
          DEFAULT: "rgba(255,255,255,0.07)",
          gold: "rgba(201,168,76,0.25)",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
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
