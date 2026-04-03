// ---------------------------------------------------------------------------
// Navigation types — shared by rules module and shell components
// ---------------------------------------------------------------------------

/** Identifier for a Lucide icon, mapped to components at the UI layer. */
export type NavIconName =
  | "home"
  | "map"
  | "heart"
  | "compass"
  | "gem"
  | "message-circle"
  | "calendar-days"
  | "hotel"
  | "building"
  | "car";

/** A single navigation link entry. */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Lucide icon name — resolved to a component by the Sidebar/nav renderer. */
  icon: NavIconName;
  /** When true the item should only be shown to authenticated users. */
  requiresAuth?: boolean;
  /** Optional badge value (e.g. unread count). `undefined` means no badge. */
  badge?: number | string;
  /** Optional sub-items rendered as a collapsible submenu (one level only). */
  children?: NavItem[];
}

/** A logical group of navigation items. */
export interface NavGroup {
  id: "discover" | "account";
  label: string;
  items: NavItem[];
}
