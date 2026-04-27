import type { NavGroup, NavItem } from "@/types/navigation";
import type { UserRole } from "@/types/tenant";

// Role hierarchy: super_admin > tenant_admin > user
const ROLE_RANK: Record<string, number> = {
  user: 1,
  tenant_admin: 2,
  super_admin: 3,
};

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
    { id: "tours", label: "Tours", href: "/tours", icon: "compass" },
    {
      id: "rooms",
      label: "Rooms",
      href: "/rooms/hotels",
      icon: "hotel",
      children: [
        { id: "hotels", label: "Hotels", href: "/rooms/hotels", icon: "hotel" },
        { id: "airbnbs", label: "Airbnbs", href: "/rooms/airbnbs", icon: "building" },
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

/** Portal group — authenticated user's personal dashboard areas. */
export const PORTAL_NAV_GROUP: NavGroup = {
  id: "portal",
  label: "My Portal",
  items: [
    { id: "portal-overview", label: "Overview", href: "/dashboard", icon: "layout-dashboard", requiresAuth: true },
    { id: "portal-bookings", label: "My Bookings", href: "/dashboard/bookings", icon: "calendar-days", requiresAuth: true },
    { id: "portal-saved", label: "Saved Diamonds", href: "/dashboard/saved", icon: "gem", requiresAuth: true },
    { id: "portal-chat", label: "Concierge Chat", href: "/dashboard/chat", icon: "message-circle", requiresAuth: true },
    { id: "portal-profile", label: "Profile", href: "/dashboard/profile", icon: "user", requiresAuth: true },
  ],
};

/** Tenant admin group — visible to tenant_admin and super_admin. */
export const TENANT_ADMIN_GROUP: NavGroup = {
  id: "tenant-admin",
  label: "Tenant Admin",
  requiredRole: "tenant_admin",
  items: [
    { id: "tenant-dashboard", label: "Dashboard", href: "/dashboard/admin", icon: "layout-dashboard", requiresAuth: true },
    { id: "tenant-bookings", label: "All Bookings", href: "/dashboard/admin/bookings", icon: "calendar-days", requiresAuth: true },
    { id: "tenant-concierge", label: "Concierge Admin", href: "/dashboard/concierge", icon: "headphones", requiresAuth: true },
    { id: "tenant-settings", label: "Settings", href: "/dashboard/admin/settings", icon: "settings", requiresAuth: true },
  ],
};

/** Super admin group — visible to super_admin only. */
export const SUPER_ADMIN_GROUP: NavGroup = {
  id: "super-admin",
  label: "Super Admin",
  requiredRole: "super_admin",
  items: [
    { id: "super-dashboard", label: "Platform Overview", href: "/dashboard/super", icon: "bar-chart", requiresAuth: true },
    { id: "super-tenants", label: "Tenants", href: "/dashboard/super/tenants", icon: "building", requiresAuth: true },
    { id: "super-users", label: "Users", href: "/dashboard/admin/users", icon: "users", requiresAuth: true },
  ],
};

/** Sidebar navigation groups — public/discover only. Admin groups live in DashboardAside. */
export const ALL_NAV_GROUPS: NavGroup[] = [DISCOVER_GROUP];

/** Admin nav groups rendered in the dashboard aside — filtered by role at render time. */
export const ADMIN_NAV_GROUPS: NavGroup[] = [TENANT_ADMIN_GROUP, SUPER_ADMIN_GROUP];

/**
 * Return admin-only nav groups the given role is permitted to see.
 * Returns an empty array for regular users.
 */
export function getAdminNavGroupsForRole(role?: UserRole | null): NavGroup[] {
  const userRank = ROLE_RANK[role ?? "user"] ?? 1;
  return ADMIN_NAV_GROUPS.filter(
    (group) => userRank >= (ROLE_RANK[group.requiredRole ?? "super_admin"] ?? 999),
  );
}

/**
 * Return dashboard nav groups including the personal "My Portal" section
 * plus any admin groups the role is permitted to see.
 * Every authenticated user gets PORTAL_NAV_GROUP at the top.
 */
export function getDashboardNavGroupsForRole(role?: UserRole | null): NavGroup[] {
  return [PORTAL_NAV_GROUP, ...getAdminNavGroupsForRole(role)];
}

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
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
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

/**
 * Filter navigation groups based on the user's role.
 * Groups without a requiredRole are always included.
 * Groups with a requiredRole are included if the user's role rank >= required rank.
 */
export function getNavGroupsForRole(role?: UserRole | null): NavGroup[] {
  const userRank = ROLE_RANK[role ?? "user"] ?? 1;
  return ALL_NAV_GROUPS.filter((group) => {
    if (!group.requiredRole) return true;
    return userRank >= (ROLE_RANK[group.requiredRole] ?? 999);
  });
}
