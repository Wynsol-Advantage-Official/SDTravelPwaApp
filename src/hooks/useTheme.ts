"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "sdtravel-theme"

function applyTheme(isDark: boolean) {
  const root = document.documentElement
  if (isDark) {
    root.classList.add("dark")
    root.setAttribute("data-theme", "sanddiamonds-dark")
  } else {
    root.classList.remove("dark")
    root.removeAttribute("data-theme")
  }
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial = stored !== null ? stored === "dark" : prefersDark
    setIsDark(initial)
    applyTheme(initial)
  }, [])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      applyTheme(next)
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light")
      return next
    })
  }, [])

  return { isDark, toggle }
}
