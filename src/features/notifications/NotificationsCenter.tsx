"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, CheckCheck, ClipboardList, CreditCard, HeartHandshake, Star, Trash2, type LucideIcon } from "lucide-react";
import { DataTablePagination } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ListParams } from "@/lib/api/types";
import { notificationHref, panelOf, useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications, useUnreadCount, type Notification } from "./api";

const ICONS: [RegExp, LucideIcon][] = [
  [/^booking/, CalendarDays],
  [/^adoption_application/, ClipboardList],
  [/^adoption/, HeartHandshake],
  [/^review/, Star],
  [/^payment/, CreditCard],
];
const iconFor = (type: string) => ICONS.find(([re]) => re.test(type))?.[1] ?? Bell;

/** Full notifications list (all three panels). Unread filter, mark read / all read, delete, click-through to the related record. */
export function NotificationsCenter() {
  const panel = panelOf(usePathname());
  const [params, setParams] = useState<ListParams>({ page: 1, limit: 15 });
  const q = useNotifications(params);
  const unread = useUnreadCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const remove = useDeleteNotification();
  const onlyUnread = params.unread === true;
  const rows = q.data?.data ?? [];
  const unreadCount = unread.data?.count ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter" className="inline-flex rounded-xl bg-muted p-1">
          {[
            { label: "All", value: false },
            { label: `Unread${unreadCount ? ` (${unreadCount})` : ""}`, value: true },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={onlyUnread === t.value}
              onClick={() => setParams({ page: 1, limit: 15, ...(t.value && { unread: true }) })}
              className={cn("rounded-lg px-3.5 py-1.5 text-sm font-medium", onlyUnread === t.value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" disabled={!unreadCount || markAll.isPending} onClick={() => markAll.mutate()}>
          <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all as read
        </Button>
      </div>

      {q.isPending ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !rows.length ? (
        <EmptyState icon={Bell} title={onlyUnread ? "No unread notifications" : "No notifications yet"} description="Updates about bookings, payments, adoptions and reviews show up here." className="bg-card" />
      ) : (
        <ul className={cn("divide-y overflow-hidden rounded-xl border bg-card transition-opacity", q.isPlaceholderData && "opacity-60")}>
          {rows.map((n) => (
            <Row key={n.id} n={n} href={notificationHref(n, panel)} onRead={() => markRead.mutate(n.id)} onDelete={() => remove.mutate(n.id)} />
          ))}
        </ul>
      )}

      {q.data && q.data.meta.totalPages > 1 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <DataTablePagination meta={q.data.meta} onChange={(p) => setParams((s) => ({ ...s, ...p }))} />
        </div>
      )}
    </div>
  );
}

function Row({ n, href, onRead, onDelete }: { n: Notification; href: string | null; onRead: () => void; onDelete: () => void }) {
  const Icon = iconFor(n.type);
  const unread = !n.readAt;
  const body = (
    <>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", unread && "font-semibold")}>{n.title}</span>
        <span className="block text-sm text-muted-foreground">{n.message}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground" title={formatDateTime(n.createdAt)}>
          {timeAgo(n.createdAt)}
        </span>
      </span>
    </>
  );
  return (
    <li className={cn("group flex items-start gap-2 px-4 py-3", unread && "bg-primary/[0.03]")}>
      {href ? (
        <Link href={href} onClick={() => unread && onRead()} className="flex min-w-0 flex-1 gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {body}
        </Link>
      ) : (
        <button type="button" onClick={() => unread && onRead()} className="flex min-w-0 flex-1 gap-3 rounded-lg text-left">
          {body}
        </button>
      )}
      <div className="flex shrink-0 items-center gap-1">
        {unread && <span className="mr-1 h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
        {unread && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRead} aria-label="Mark as read" title="Mark as read">
            <CheckCheck className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label="Delete notification" title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
