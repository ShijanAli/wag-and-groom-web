import { ROLES, type PermissionSlug } from "@/lib/permissions";
import type { AuthUser, User } from "@/types/models";

export const fullName = (u?: Pick<User, "firstName" | "lastName"> | null) =>
  u ? `${u.firstName} ${u.lastName}`.trim() : "";

export const initials = (u?: Pick<User, "firstName" | "lastName"> | null) =>
  u ? `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase() : "?";

export const isCustomer = (u?: AuthUser | null) => u?.role.slug === ROLES.CUSTOMER;
export const isStaff = (u?: AuthUser | null) => u?.role.slug === ROLES.STAFF;

/** Panels by role: customer → /dashboard, staff → /staff, everyone else (admins & custom roles) → /admin */
export function homePathFor(u?: AuthUser | null): string {
  if (!u) return "/login";
  if (isCustomer(u)) return "/dashboard";
  if (isStaff(u)) return "/staff";
  return "/admin";
}

/** super_admin bypasses permission checks — same rule as the backend `authorize()` middleware. */
export function hasPermission(u: AuthUser | null | undefined, permission: PermissionSlug | string): boolean {
  if (!u) return false;
  return u.role.slug === ROLES.SUPER_ADMIN || u.permissions.includes(permission);
}

export const hasAnyPermission = (u: AuthUser | null | undefined, perms: readonly (PermissionSlug | string)[]) =>
  perms.length === 0 || perms.some((p) => hasPermission(u, p));

/** Only allow same-origin relative redirects (`?from=/admin/bookings`), never `//evil.com`. */
export const safeRedirect = (from: string | null | undefined): string | null =>
  from && from.startsWith("/") && !from.startsWith("//") ? from : null;

const PANEL_PREFIXES = ["/admin", "/dashboard", "/staff"];

/**
 * Where to go after sign-in: back to `?from` when that page belongs to the user's own panel
 * (or is a public page), otherwise the user's home panel. A customer with `?from=/admin` lands on /dashboard.
 */
export function postLoginPath(u: AuthUser, from: string | null | undefined): string {
  const target = safeRedirect(from);
  const home = homePathFor(u);
  if (!target) return home;
  const panel = PANEL_PREFIXES.find((p) => target === p || target.startsWith(`${p}/`));
  return !panel || panel === home ? target : home;
}
