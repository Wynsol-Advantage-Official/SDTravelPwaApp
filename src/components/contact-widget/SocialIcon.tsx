"use client";

// ---------------------------------------------------------------------------
// SocialIcon — minimal inline SVG per platform.
// Uses currentColor so the parent controls the icon colour via text-* classes.
// ---------------------------------------------------------------------------

import type { SocialPlatform } from "@/types/contact";

interface SocialIconProps {
  platform: SocialPlatform;
  size?: number;
  className?: string;
}

export function SocialIcon({ platform, size = 16, className }: SocialIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[platform]}
    </svg>
  );
}

const PATHS: Record<SocialPlatform, React.ReactNode> = {
  instagram: (
    <>
      <rect
        x="2" y="2" width="20" height="20" rx="5" ry="5"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle
        cx="12" cy="12" r="4"
        stroke="currentColor" strokeWidth="2"
      />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </>
  ),
  facebook: (
    <path
      d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    />
  ),
  x: (
    <>
      <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  tiktok: (
    <path
      d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    />
  ),
  youtube: (
    <>
      <rect
        x="2" y="5" width="20" height="14" rx="4"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <polygon points="10,9 16,12 10,15" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <rect
        x="2" y="9" width="4" height="12"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
    </>
  ),
};
