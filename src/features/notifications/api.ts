"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation, createKeys } from "@/lib/api/hooks";
import { api } from "@/lib/api/request";
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
  list: (limit = 8) => api.list<Notification>(BASE, { limit, sortBy: "createdAt", sortOrder: "desc" }),
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
  useQuery({ queryKey: notificationKeys.list({ limit: 8 }), queryFn: () => notificationsApi.list(8), enabled });

const invalidate = [notificationKeys.all];
export const useMarkRead = () => useApiMutation(notificationsApi.markRead, { invalidate, successMessage: false });
export const useMarkAllRead = () => useApiMutation(notificationsApi.markAllRead, { invalidate, successMessage: false });
