import type { NavGroup, NavItem } from "@/types/navigation";

// ---------------------------------------------------------------------------
// Navigation definitions
// ---------------------------------------------------------------------------

/** Discover group — public-facing site areas. */
export const DISCOVER_GROUP: NavGroup = {
  id: "discover",
  label: "Discover",
  items: [
    { id: "home", label: "Home", href: "/", icon: "home" },
    { id: "destinations", label: "Destinations", href: "/destinations", icon: "map" },
    { id: "saved", label: "Saved", href: "/dashboard/saved", icon: "heart", requiresAuth: true },
    { id: "tours", label: "Tours", href: "/tours", icon: "compass" },
    {
      id: "accommodations",
      label: "Accommodations",
      href: "/accommodations/hotels",
      icon: "hotel",
      children: [
        { id: "hotels", label: "Hotels", href: "/accommodations/hotels", icon: "hotel" },
        { id: "airbnbs", label: "Airbnbs", href: "/accommodations/airbnbs", icon: "building" },
      ],
    },
    { id: "taxi", label: "Taxi", href: "/taxi", icon: "car" },
  ],
};

/** Account group — authenticated user areas. */
export const ACCOUNT_GROUP: NavGroup = {
  id: "account",
  label: "Account",
  items: [
    { id: "my-diamonds", label: "My Diamonds", href: "/dashboard", icon: "gem", requiresAuth: true },
    { id: "concierge", label: "Concierge", href: "/dashboard/concierge", icon: "message-circle", requiresAuth: true },
    { id: "bookings", label: "Bookings", href: "/my-bookings", icon: "calendar-days", requiresAuth: true },
  ],
};

/** All sidebar navigation groups in display order. */
export const SIDEBAR_NAV_GROUPS: NavGroup[] = [DISCOVER_GROUP];

// ---------------------------------------------------------------------------
// Pure helper functions
// ---------------------------------------------------------------------------

/**
 * Determine whether a nav item is active for the given pathname.
 *
 * - The root `/` item matches only an exact pathname of `/`.
 * - All other items match when the pathname starts with their href.
 * - Hrefs with query strings are compared by pathname portion only.
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  // Strip query string / fragment from href for comparison
  const hrefPath = item.href.split("?")[0].split("#")[0];
  if (hrefPath === "/") {
    return pathname === "/";
  }
  if (pathname === hrefPath || pathname.startsWith(`${hrefPath}/`)) return true;
  // An item with children is active when any child matches
  return item.children?.some((child) => isNavItemActive(child, pathname)) ?? false;
}

/**
 * Return the first active NavItem across all groups for the given pathname,
 * or `null` if no item matches.
 */
export function getActiveNavItem(
  pathname: string,
  groups: NavGroup[] = SIDEBAR_NAV_GROUPS,
): NavItem | null {
  for (const group of groups) {
    for (const item of group.items) {
      if (isNavItemActive(item, pathname)) {
        return item;
      }
    }
  }
  return null;
}
