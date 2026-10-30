"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createKeys, createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { Id } from "@/lib/api/types";
import type { ActiveStatus, ActivityLog, BookingsByStatus, DashboardStats, Permission, RevenueReport, Role, Setting, TopService } from "@/types/models";

/* ───── dashboard ───── */
export interface DateRange {
  from: string;
  to: string;
}

const dashKeys = createKeys("dashboard");
const dashOpts = { staleTime: 60_000, placeholderData: keepPreviousData } as const;

export const useDashboardStats = () => useQuery({ queryKey: [...dashKeys.all, "stats"], queryFn: () => api.get<DashboardStats>("/dashboard/stats"), staleTime: 60_000, refetchInterval: 5 * 60_000 });
export const useRevenue = (range: DateRange & { groupBy: "day" | "month" }) =>
  useQuery({ queryKey: [...dashKeys.all, "revenue", range], queryFn: () => api.get<RevenueReport>("/dashboard/revenue", { ...range }), ...dashOpts });
export const useTopServices = (range: DateRange) =>
  useQuery({ queryKey: [...dashKeys.all, "top", range], queryFn: () => api.get<TopService[]>("/dashboard/top-services", { ...range, limit: 5 }), ...dashOpts });
export const useBookingsByStatus = (range: DateRange) =>
  useQuery({ queryKey: [...dashKeys.all, "by-status", range], queryFn: () => api.get<BookingsByStatus>("/dashboard/bookings-by-status", { ...range }), ...dashOpts });

/* ───── roles & permissions ───── */
export interface RoleInput {
  name: string;
  description?: string | null;
  status: ActiveStatus;
  permissionIds?: number[];
}

const rolesResource = createResource<Role, RoleInput, Partial<Omit<RoleInput, "permissionIds">>>("/roles");
export const roleHooks = createResourceHooks("roles", rolesResource);

export const useSetRolePermissions = () =>
  useApiMutation(({ id, permissionIds }: { id: Id; permissionIds: number[] }) => api.put<Role>(`/roles/${id}/permissions`, { permissionIds }), {
    invalidate: [roleHooks.keys.all],
    successMessage: "Permissions saved",
  });

/** All permissions (≈60) — static per deploy, so cached for the session. */
export const usePermissions = () =>
  useQuery({ queryKey: ["permissions"], queryFn: () => api.get<Permission[]>("/permissions", { limit: 500 }), staleTime: Infinity });

/** Role options for selects. `exclude` drops slugs (e.g. "customer" on the team page). */
export const useRoleOptions = (exclude: string[] = []) =>
  useQuery({
    queryKey: roleHooks.keys.list({ limit: 100, sortBy: "name", sortOrder: "asc" }),
    queryFn: () => rolesResource.list({ limit: 100, sortBy: "name", sortOrder: "asc" }),
    staleTime: 5 * 60_000,
    select: (r) => r.data.filter((role) => !exclude.includes(role.slug)).map((role) => ({ value: role.id, label: role.name, slug: role.slug })),
  });

/** "booking_status" → "Booking status" */
export const moduleLabel = (m: string) => (m.charAt(0).toUpperCase() + m.slice(1)).replace(/_/g, " ");

/* ───── settings ───── */
export const settingKeys = createKeys("settings");
export const useSettings = () => useQuery({ queryKey: [...settingKeys.all, "all"], queryFn: () => api.get<Setting[]>("/settings") });
export const useUpdateSettings = () =>
  useApiMutation((values: Record<string, unknown>) => api.patch<Setting[]>("/settings", { values }), {
    // public settings feed the website, booking wizard and contact details
    invalidate: [settingKeys.all],
    revalidate: ["settings"],
    successMessage: "Settings saved",
  });

/* ───── activity log ───── */
export const activityLogHooks = createResourceHooks("activity-logs", createResource<ActivityLog, never, never>("/activity-logs"));

export const LOG_ACTION_OPTIONS = [
  { label: "Created", value: "create" },
  { label: "Updated", value: "update" },
  { label: "Deleted", value: "delete" },
];

/** Module tags written by the API's activity-log middleware (the router names). */
export const LOG_MODULES = [
  "Adoption Applications",
  "Adoption Pets",
  "Adoptions",
  "Blocked Dates",
  "Blog",
  "Bookings",
  "Contact",
  "FAQs",
  "Gallery",
  "Newsletter",
  "Payments",
  "Pet Types",
  "Promotions",
  "Reviews",
  "Roles",
  "Service Categories",
  "Services",
  "Settings",
  "Staff",
  "Testimonials",
  "Users",
].map((m) => ({ value: m, label: m }));
