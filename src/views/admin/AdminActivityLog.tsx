"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DataTable, DataTableToolbar, RowActions, TableDateRange, TableFilter } from "@/components/common/data-table";
import { DetailList } from "@/components/common/DetailList";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, type Tone } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { formatDateTime, timeAgo } from "@/lib/format";
import { LOG_ACTION_OPTIONS, LOG_MODULES, activityLogHooks } from "@/features/system/api";
import type { ActivityLog, LogAction } from "@/types/models";

const ACTION: Record<LogAction, { label: string; tone: Tone }> = {
  create: { label: "Created", tone: "success" },
  update: { label: "Updated", tone: "info" },
  delete: { label: "Deleted", tone: "danger" },
};

const summaryOf = (l: ActivityLog) => l.newValues?.summary ?? l.newValues?.route ?? `${ACTION[l.action].label} ${l.modelType ?? "record"}`;

/** "Mozilla/5.0 (Windows NT 10.0…) Chrome/130" → "Chrome on Windows" (good enough for an audit trail). */
function device(ua: string | null) {
  if (!ua) return "—";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : ua.split(/[ /]/)[0];
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : null;
  return os ? `${browser} on ${os}` : browser;
}

export default function AdminActivityLog() {
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc", limit: 20 } });
  const query = activityLogHooks.useList(list.params);
  const detail = useDisclosure<ActivityLog>();

  const columns = useMemo<ColumnDef<ActivityLog>[]>(
    () => [
      {
        id: "createdAt",
        header: "When",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm" title={formatDateTime(row.original.createdAt)}>
            {timeAgo(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "user",
        header: "Who",
        cell: ({ row }) => (row.original.user ? <UserCell user={row.original.user} secondary={row.original.user.email} /> : <span className="text-muted-foreground">System</span>),
      },
      { id: "action", header: "Action", cell: ({ row }) => <StatusBadge status={row.original.action} {...ACTION[row.original.action]} /> },
      {
        id: "summary",
        header: "What",
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <p className="font-medium">{summaryOf(row.original)}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.modelType}
              {row.original.modelId && ` #${row.original.modelId}`}
            </p>
          </div>
        ),
      },
      { id: "ip", header: "From", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{row.original.ipAddress ?? "—"}</span> },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => <RowActions actions={[{ label: "Details", icon: Eye, onClick: () => detail.open(row.original) }]} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <PageHeader title="Activity log" description="Every change made through the panel or the API — who did what, and when." />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={detail.open}
        emptyTitle="No activity"
        emptyDescription="Try a wider date range or different filters."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search person, email or module…"
            filters={
              <>
                <TableFilter list={list} param="modelType" options={LOG_MODULES} allLabel="All modules" placeholder="Module" />
                <TableFilter list={list} param="action" options={LOG_ACTION_OPTIONS} allLabel="All actions" placeholder="Action" />
                <TableDateRange list={list} />
              </>
            }
          />
        }
      />
      <LogModal log={detail.item} open={detail.isOpen} onOpenChange={detail.setOpen} />
    </>
  );
}

function LogModal({ log, open, onOpenChange }: { log: ActivityLog | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!log) return null;
  const body = log.newValues?.body;
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title={summaryOf(log)} description={formatDateTime(log.createdAt)}>
      <div className="space-y-5">
        <DetailList
          items={[
            { label: "Action", value: <StatusBadge status={log.action} {...ACTION[log.action]} /> },
            { label: "Record", value: `${log.modelType ?? "—"}${log.modelId ? ` #${log.modelId}` : ""}` },
            { label: "By", value: log.user ? `${log.user.firstName} ${log.user.lastName} · ${log.user.email}` : "System" },
            { label: "Request", value: log.newValues?.route ? <code className="text-xs">{log.newValues.route}</code> : "—" },
            { label: "IP address", value: log.ipAddress },
            { label: "Device", value: device(log.userAgent) },
          ]}
        />
        {log.oldValues && <JsonBlock title="Before" value={log.oldValues} />}
        {body && Object.keys(body).length > 0 && <JsonBlock title={log.oldValues ? "After" : "Data sent"} value={body} />}
      </div>
    </Modal>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <pre className="max-h-72 overflow-auto rounded-xl bg-muted p-4 text-xs leading-relaxed">{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}
