"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiMutation, createKeys } from "@/lib/api/hooks";
import { api } from "@/lib/api/request";
import type { ListParams } from "@/lib/api/types";
import type { ISODate } from "@/types/models";

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: ISODate | null;
  createdAt: ISODate;
}

const BASE = "/me/notifications";
export const notificationKeys = createKeys("notifications");

export const notificationsApi = {
  list: (params: ListParams = { limit: 8 }) => api.list<Notification>(BASE, { sortBy: "createdAt", sortOrder: "desc", ...params }),
  remove: (id: number) => api.delete(`${BASE}/${id}`),
  unreadCount: () => api.get<{ count: number }>(`${BASE}/unread-count`),
  markRead: (id: number) => api.patch(`${BASE}/${id}/read`),
  markAllRead: () => api.patch(`${BASE}/read-all`),
};

/** Badge count — polls every minute, pauses in background tabs (react-query default). */
export const useUnreadCount = (enabled = true) =>
  useQuery({
    queryKey: [...notificationKeys.all, "unread"],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 60_000,
    enabled,
  });

/** Latest notifications for the bell dropdown — fetched only while it's open. */
export const useLatestNotifications = (enabled: boolean) =>
  useQuery({ queryKey: notificationKeys.list({ limit: 8 }), queryFn: () => notificationsApi.list({ limit: 8 }), enabled });

/** Full, paginated list for the notifications page. */
export const useNotifications = (params: ListParams) =>
  useQuery({ queryKey: notificationKeys.list(params), queryFn: () => notificationsApi.list(params), placeholderData: keepPreviousData });

const invalidate = [notificationKeys.all];
export const useMarkRead = () => useApiMutation(notificationsApi.markRead, { invalidate, successMessage: false });
export const useMarkAllRead = () => useApiMutation(notificationsApi.markAllRead, { invalidate, successMessage: false });
export const useDeleteNotification = () => useApiMutation(notificationsApi.remove, { invalidate, successMessage: false });

export type Panel = "admin" | "staff" | "customer";

/** Which panel the current URL belongs to (the bell is shared by all three). */
export const panelOf = (pathname: string): Panel => (pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/staff") ? "staff" : "customer");

export const NOTIFICATIONS_PAGE: Record<Panel, string> = {
  admin: "/admin/notifications",
  staff: "/staff?tab=notifications",
  customer: "/dashboard?tab=notifications",
};

/** Where clicking a notification goes, from its `data` (booking / application / review / adoption). */
export function notificationHref(n: Pick<Notification, "type" | "data">, panel: Panel): string | null {
  const d = (n.data ?? {}) as Record<string, string | number | undefined>;
  const q = (v: string | number) => encodeURIComponent(String(v));
  if (panel === "admin") {
    if (d.bookingNo) return `/admin/bookings?searchTerm=${q(d.bookingNo)}`;
    if (d.applicationNo) return `/admin/adoption-applications?searchTerm=${q(d.applicationNo)}`;
    if (d.reviewId) return "/admin/reviews?status=all";
    if (d.adoptionId) return "/admin/adoptions";

    return null;
  }
  if (panel === "staff") return d.bookingNo ? "/staff?tab=upcoming" : null;
  if (d.bookingNo) return "/dashboard?tab=bookings&period=all";
  if (d.applicationNo || d.adoptionId) return "/dashboard?tab=adoptions";
  if (d.reviewId) return "/dashboard?tab=reviews";

  return null;
}
