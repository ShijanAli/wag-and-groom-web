import {
  CalendarDays,
  Image,
  LayoutDashboard,
  Scissors,
  Shield,
  Star,
  Tag,
  User,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PERMISSIONS as P, type PermissionSlug } from "@/lib/permissions";

export interface AdminNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Visible + reachable when the user has ANY of these. Empty = every panel user. */
  anyOf: PermissionSlug[];
  keywords?: string[];
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/**
 * Single source of truth for the admin panel: the sidebar, the topbar menu search
 * and the per-route permission guard all read this list. New page = one entry here.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, anyOf: [P.DASHBOARD.VIEW], keywords: ["home", "overview", "stats"] },
      { title: "Bookings", url: "/admin/bookings", icon: CalendarDays, anyOf: [P.BOOKING.VIEW], keywords: ["appointments", "schedule"] },
      {
        title: "Services",
        url: "/admin/services",
        icon: Scissors,
        anyOf: [P.SERVICE.CREATE, P.SERVICE.UPDATE, P.SERVICE.DELETE],
        keywords: ["catalog", "pricing"],
      },
      { title: "Customers", url: "/admin/customers", icon: Users, anyOf: [P.USER.VIEW], keywords: ["clients", "users"] },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Staff", url: "/admin/staff", icon: UserCog, anyOf: [P.STAFF_SCHEDULE.VIEW], keywords: ["team", "employees"] },
      { title: "Reviews", url: "/admin/reviews", icon: Star, anyOf: [P.REVIEW.VIEW], keywords: ["ratings", "feedback"] },
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: Image,
        anyOf: [P.GALLERY.CREATE, P.GALLERY.UPDATE, P.GALLERY.DELETE],
        keywords: ["photos", "images"],
      },
      { title: "Promotions", url: "/admin/promotions", icon: Tag, anyOf: [P.PROMOTION.VIEW], keywords: ["promo", "discount", "coupon"] },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Roles & Permissions", url: "/admin/roles", icon: Shield, anyOf: [P.ROLE.VIEW], keywords: ["access", "security"] },
      { title: "Profile", url: "/admin/profile", icon: User, anyOf: [], keywords: ["account", "password"] },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));

/** Longest matching prefix wins, so /admin/services/12 resolves to the Services entry. */
export function findNavItem(pathname: string) {
  return ADMIN_NAV_ITEMS.filter((i) => (i.url === "/admin" ? pathname === "/admin" : pathname === i.url || pathname.startsWith(`${i.url}/`))).sort(
    (a, b) => b.url.length - a.url.length,
  )[0];
}
