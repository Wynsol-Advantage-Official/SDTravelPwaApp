"use client";

// ---------------------------------------------------------------------------
// useContactInfo — derives ContactInfo from the TenantProvider context.
// ---------------------------------------------------------------------------
// No fetch required — branding is already available via useTenant() which is
// pre-populated by the root layout from Firestore server-side.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { useTenant } from "@/hooks/useTenant";
import type { ContactInfo, SocialPlatform } from "@/types/contact";

function digitsOnly(str: string): string {
  return str.replace(/\D/g, "");
}

const PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "x",
  "tiktok",
  "youtube",
  "linkedin",
];

export function useContactInfo(): ContactInfo {
  const { tenantName, branding } = useTenant();

  return useMemo(() => {
    const s = branding?.social ?? {};
    const social: ContactInfo["social"] = PLATFORMS.filter(
      (p) => Boolean(s[p as keyof typeof s]),
    ).map((p) => ({ platform: p, url: s[p as keyof typeof s] as string }));

    const rawPhone = branding?.phone ?? null;

    return {
      tenantName,
      phone: rawPhone,
      whatsappNumber: rawPhone ? digitsOnly(rawPhone) : null,
      email: branding?.supportEmail ?? null,
      social,
    };
  }, [tenantName, branding]);
}
