"use client";

import { useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Mail, MailOpen, Phone, Reply, Trash2 } from "lucide-react";
import { DataTable, DataTableToolbar, RowActions, TableTabs } from "@/components/common/data-table";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete } from "@/hooks/use-crud";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { formatDateTime, timeAgo } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { CONTACT_STATUS_OPTIONS, contactHooks, useSetContactStatus } from "@/features/content/api";
import type { ContactMessage } from "@/types/models";

/** Pre-filled reply in the admin's own mail app (quoted original included). */
const mailtoReply = (m: ContactMessage) =>
  `mailto:${m.email}?${new URLSearchParams({
    subject: `Re: ${m.subject}`,
    body: `Hi ${m.name.split(" ")[0]},\n\n\n\n— ${SITE.name}\n\n> ${m.message.replace(/\n/g, "\n> ")}`,
  })
    .toString()
    .replace(/\+/g, "%20")}`;

export default function AdminInbox() {
  const { can } = useAuth();
  const canUpdate = can(P.CONTACT.UPDATE);
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = contactHooks.useList(list.params);
  const open = useDisclosure<ContactMessage>();
  const setStatus = useSetContactStatus();
  const remove = useCrudDelete(contactHooks, "message", (m: ContactMessage) => m.subject);

  const columns = useMemo<ColumnDef<ContactMessage>[]>(
    () => [
      {
        id: "from",
        header: "From",
        cell: ({ row }) => {
          const unread = row.original.status === "new";
          return (
            <div className="flex min-w-[160px] items-center gap-2.5">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", unread ? "bg-primary" : "bg-transparent")} aria-label={unread ? "Unread" : undefined} />
              <div className="min-w-0">
                <p className={cn("truncate", unread && "font-semibold")}>{row.original.name}</p>
                <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "subject",
        header: "Message",
        cell: ({ row }) => (
          <div className="min-w-[240px] max-w-xl">
            <p className={cn("truncate", row.original.status === "new" && "font-semibold")}>{row.original.subject}</p>
            <p className="truncate text-sm text-muted-foreground">{row.original.message}</p>
          </div>
        ),
      },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "createdAt",
        header: "Received",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground" title={formatDateTime(row.original.createdAt)}>
            {timeAgo(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const m = row.original;
          return (
            <RowActions
              actions={[
                { label: "Open", icon: MailOpen, onClick: () => open.open(m) },
                { label: "Mark as unread", icon: Mail, onClick: () => setStatus.mutate({ id: m.id, status: "new" }), visible: canUpdate && m.status !== "new" },
                { label: "Mark as replied", icon: CheckCheck, onClick: () => setStatus.mutate({ id: m.id, status: "replied" }), visible: canUpdate && m.status !== "replied" },
                { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(m), visible: canUpdate },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canUpdate, remove],
  );

  return (
    <>
      <PageHeader title="Messages" description="Everything sent through the website's contact form." />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={open.open}
        emptyTitle={list.params.status === "new" ? "Inbox zero 🎉" : "No messages"}
        emptyDescription="Messages from the contact form will land here."
        toolbar={
          <div className="space-y-3">
            <TableTabs list={list} options={CONTACT_STATUS_OPTIONS.map((o) => (o.value === "new" ? { ...o, label: "Unread" } : o))} />
            <DataTableToolbar list={list} searchPlaceholder="Search name, email, subject…" />
          </div>
        }
      />
      <MessageModal message={open.item} open={open.isOpen} onOpenChange={open.setOpen} canUpdate={canUpdate} onDelete={(m) => (open.close(), remove(m))} />
    </>
  );
}

function MessageModal({
  message,
  open,
  onOpenChange,
  canUpdate,
  onDelete,
}: {
  message: ContactMessage | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  canUpdate: boolean;
  onDelete: (m: ContactMessage) => void;
}) {
  const qc = useQueryClient();
  // GET /contact/:id marks the message read on the server
  const detail = contactHooks.useOne(open ? message?.id : null);
  const setStatus = useSetContactStatus();
  const m = detail.data ?? message;

  // …so refresh the list (unread dot / counts) once it has been opened
  useEffect(() => {
    if (detail.isSuccess && message?.status === "new") qc.invalidateQueries({ queryKey: contactHooks.keys.lists() });
  }, [detail.isSuccess, message?.status, qc]);

  if (!m) return null;
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={m.subject}
      description={`${formatDateTime(m.createdAt)} · ${timeAgo(m.createdAt)}`}
      footer={
        <>
          {canUpdate && (
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto" onClick={() => onDelete(m)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
          {canUpdate && m.status !== "replied" && (
            <Button variant="outline" onClick={() => setStatus.mutate({ id: m.id, status: "replied" })} disabled={setStatus.isPending}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark as replied
            </Button>
          )}
          <Button asChild>
            <a href={mailtoReply(m)} onClick={() => canUpdate && m.status !== "replied" && setStatus.mutate({ id: m.id, status: "replied" })}>
              <Reply className="mr-2 h-4 w-4" /> Reply by email
            </a>
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
          <div>
            <p className="font-semibold">{m.name}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Mail className="h-3.5 w-3.5" /> {m.email}
              </a>
              {m.phone && (
                <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> {m.phone}
                </a>
              )}
            </div>
          </div>
          <StatusBadge status={m.status} />
        </div>
        <p className="whitespace-pre-line leading-relaxed">{m.message}</p>
      </div>
    </Modal>
  );
}
