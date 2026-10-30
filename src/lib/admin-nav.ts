import {
  CalendarDays,
  ClipboardList,
  HeartHandshake,
  HelpCircle,
  Inbox,
  Mail,
  Newspaper,
  Quote,
  Home,
  CalendarOff,
  FolderTree,
  PawPrint,
  Image,
  LayoutDashboard,
  Scissors,
  Shield,
  Star,
  Tag,
  User,
  UserCog,
  Users,
  Wallet,
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
      { title: "Payments", url: "/admin/payments", icon: Wallet, anyOf: [P.PAYMENT.VIEW], keywords: ["transactions", "refunds", "sslcommerz", "cash"] },
      { title: "Customers", url: "/admin/customers", icon: Users, anyOf: [P.USER.VIEW], keywords: ["clients", "users"] },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        title: "Services",
        url: "/admin/services",
        icon: Scissors,
        anyOf: [P.SERVICE.CREATE, P.SERVICE.UPDATE, P.SERVICE.DELETE],
        keywords: ["catalog", "pricing"],
      },
      {
        title: "Categories",
        url: "/admin/service-categories",
        icon: FolderTree,
        anyOf: [P.SERVICE_CATEGORY.CREATE, P.SERVICE_CATEGORY.UPDATE, P.SERVICE_CATEGORY.DELETE],
        keywords: ["service categories", "groups"],
      },
      { title: "Pet Types", url: "/admin/pet-types", icon: PawPrint, anyOf: [P.PET_TYPE.CREATE, P.PET_TYPE.UPDATE, P.PET_TYPE.DELETE], keywords: ["animals", "species", "dog", "cat"] },
      { title: "Promotions", url: "/admin/promotions", icon: Tag, anyOf: [P.PROMOTION.VIEW], keywords: ["promo", "discount", "coupon"] },
    ],
  },
  {
    label: "Adoption",
    items: [
      {
        title: "Pets for Adoption",
        url: "/admin/adoption-pets",
        icon: HeartHandshake,
        anyOf: [P.ADOPTION_PET.CREATE, P.ADOPTION_PET.UPDATE, P.ADOPTION_PET.DELETE],
        keywords: ["adopt", "rescue", "shelter"],
      },
      { title: "Applications", url: "/admin/adoption-applications", icon: ClipboardList, anyOf: [P.ADOPTION_APPLICATION.VIEW], keywords: ["adoption requests", "review"] },
      { title: "Adoptions", url: "/admin/adoptions", icon: Home, anyOf: [P.ADOPTION.VIEW], keywords: ["handover", "adoption fee", "follow-up"] },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Staff", url: "/admin/staff", icon: UserCog, anyOf: [P.STAFF_SCHEDULE.VIEW], keywords: ["team", "employees", "working hours"] },
      { title: "Days Off", url: "/admin/days-off", icon: CalendarOff, anyOf: [P.BLOCKED_DATE.VIEW], keywords: ["holidays", "leave", "closed", "blocked dates"] },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Reviews", url: "/admin/reviews", icon: Star, anyOf: [P.REVIEW.VIEW], keywords: ["ratings", "feedback"] },
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: Image,
        anyOf: [P.GALLERY.CREATE, P.GALLERY.UPDATE, P.GALLERY.DELETE],
        keywords: ["photos", "images", "albums", "videos"],
      },
      { title: "Blog", url: "/admin/blog", icon: Newspaper, anyOf: [P.BLOG.VIEW, P.BLOG.CREATE, P.BLOG.UPDATE], keywords: ["posts", "articles", "news", "seo"] },
      { title: "FAQs", url: "/admin/faqs", icon: HelpCircle, anyOf: [P.FAQ.CREATE, P.FAQ.UPDATE, P.FAQ.DELETE], keywords: ["questions", "help"] },
      {
        title: "Testimonials",
        url: "/admin/testimonials",
        icon: Quote,
        anyOf: [P.TESTIMONIAL.CREATE, P.TESTIMONIAL.UPDATE, P.TESTIMONIAL.DELETE],
        keywords: ["quotes", "happy customers"],
      },
      { title: "Messages", url: "/admin/messages", icon: Inbox, anyOf: [P.CONTACT.VIEW], keywords: ["contact", "inbox", "enquiries"] },
      { title: "Newsletter", url: "/admin/newsletter", icon: Mail, anyOf: [P.NEWSLETTER.VIEW], keywords: ["subscribers", "email list", "csv"] },
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
