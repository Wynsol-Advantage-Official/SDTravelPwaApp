"use client";

// ---------------------------------------------------------------------------
// ContactWidgetGate — renders the ContactWidget on all routes except admin.
// ---------------------------------------------------------------------------
// Admin pages (/dashboard/admin, /dashboard/super) are excluded because
// operators shouldn't see the customer-facing contact FAB while managing
// the platform.
// ---------------------------------------------------------------------------

import { usePathname } from "next/navigation";
import { ContactWidget } from "./ContactWidget";

const EXCLUDED_PREFIXES = ["/dashboard/admin", "/dashboard/super"];

export function ContactWidgetGate() {
  const pathname = usePathname();

  if (EXCLUDED_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return <ContactWidget />;
}
