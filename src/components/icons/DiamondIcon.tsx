"use client"

import React from "react"

interface DiamondIconProps {
  /** Tailwind sizing classes like 'h-5 w-5' or empty to let the parent control size */
  className?: string
  /** If true, the icon will be filled with currentColor */
  filled?: boolean
  /** Stroke width (SVG units) */
  strokeWidth?: number
}

export default function DiamondIcon({ className = "", filled = false, strokeWidth = 1.8 }: DiamondIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9.5 L6.5 8 L12 4 L17.5 8 L22 9.5 L17 13 L12 20 L7 13 Z" />
      <path d="M6.5 8 L12 13 L17.5 8" opacity="0.6" />
    </svg>
  )
}
