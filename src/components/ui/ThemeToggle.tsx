"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 text-ocean-deep/60 hover:text-ocean hover:bg-ocean/10 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-chill ${className}`}
    >
      {/* Sun — visible in dark mode, click to go light */}
      <Sun
        size={15}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          isDark
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-90"
        }`}
      />
      {/* Moon — visible in light mode, click to go dark */}
      <Moon
        size={15}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          isDark
            ? "opacity-0 scale-50 -rotate-90"
            : "opacity-100 scale-100 rotate-0"
        }`}
      />
    </button>
  )
}
