"use client"

import React from "react"
const icon1 = "/logos/brand/Iconset-05.png"
const icon2 = "/logos/brand/Iconset-02.png"

interface DiamondIconProps {
  className?: string
  filled?: boolean
  strokeWidth?: number
}

// Clean, themeable diamond icon. Uses `currentColor` so Tailwind `text-...` and
// `dark:text-...` control the color. The filled variant uses `fill`, the
// outline variant uses `stroke`.
export default function DiamondIcon({ className = "", filled = false, strokeWidth = 2 }: DiamondIconProps) {
  if (filled) {
    return (
      <img
        src={icon2}
        alt="Diamond Icon"
        className={className}
      />
    )
  }

  return (
    <img
      src={icon1}
      alt="Diamond Icon"
      className={className}
    />

  )
}
