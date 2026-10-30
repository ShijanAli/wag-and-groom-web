"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, MessageSquareReply, Trash2, X } from "lucide-react";
import { DataTable, DataTableToolbar, RowActions, TableFilter, TableTabs } from "@/components/common/data-table";
import { DetailList } from "@/components/common/DetailList";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { Stars } from "@/components/common/Rating";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete } from "@/hooks/use-crud";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate, formatDateTime, timeAgo } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { useServiceOptions } from "@/features/catalog/api";
import { ReviewBody } from "@/features/reviews/components";
import { RATING_OPTIONS, REVIEW_STATUS_OPTIONS, reviewHooks, useModerateReview, useReplyReview } from "@/features/reviews/api";
import type { Review } from "@/types/models";

export default function AdminReviews() {
  const { can } = useAuth();
  const canModerate = can(P.REVIEW.MODERATE);
  const list = useListParams({ defaults: { status: "pending", sortBy: "createdAt", sortOrder: "desc" } });
  const query = reviewHooks.useList(list.params);
  const services = useServiceOptions();
  const detail = useDisclosure<Review>();
  const moderate = useModerateReview();
  const remove = useCrudDelete(reviewHooks, "review", (r: Review) => `${r.user?.firstName ?? "Customer"}'s review of ${r.service.name}`);

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        id: "review",
        header: "Review",
        cell: ({ row }) => <ReviewBody review={row.original} clamp className="min-w-[240px] max-w-md" />,
      },
      {
        id: "user",
        header: "Customer",
        cell: ({ row }) => row.original.user && <UserCell user={row.original.user} secondary={row.original.booking.bookingNo} />,
      },
      { id: "service", header: "Service", cell: ({ row }) => <span className="whitespace-nowrap">{row.original.service.name}</span> },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="space-y-1">
            <StatusBadge status={row.original.status} />
            {row.original.adminReply && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquareReply className="h-3 w-3" /> Replied
              </p>
            )}
          </div>
        ),
      },
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
          const r = row.original;
          return (
            <RowActions
              actions={[
                { label: canModerate ? "Open & reply" : "View", icon: Eye, onClick: () => detail.open(r) },
                { label: "Approve", icon: Check, onClick: () => moderate.mutate({ id: r.id, status: "approved" }), visible: canModerate && r.status !== "approved" },
                { label: "Reject", icon: X, onClick: () => moderate.mutate({ id: r.id, status: "rejected" }), visible: canModerate && r.status !== "rejected" },
                { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(r), visible: canModerate },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canModerate, remove],
  );

  return (
    <>
      <PageHeader title="Reviews" description="Customer reviews appear on the website only after you approve them." />

      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={detail.open}
        emptyTitle={list.params.status === "pending" ? "All caught up 🎉" : "No reviews"}
        emptyDescription={list.params.status === "pending" ? "There are no reviews waiting for moderation." : "Try a different filter."}
        toolbar={
          <div className="space-y-3">
            <TableTabs list={list} options={REVIEW_STATUS_OPTIONS} />
            <DataTableToolbar
              list={list}
              defaults={{ status: "pending" }}
              searchPlaceholder="Search text, service, email, booking…"
              filters={
                <>
                  <TableFilter list={list} param="rating" options={RATING_OPTIONS} allLabel="Any rating" placeholder="Rating" />
                  <TableFilter list={list} param="serviceId" options={services.data ?? []} allLabel="All services" placeholder="Service" />
                  <TableFilter
                    list={list}
                    param="sortBy"
                    allLabel={false}
                    options={[
                      { label: "Newest first", value: "createdAt" },
                      { label: "By rating", value: "rating" },
                    ]}
                    placeholder="Sort"
                  />
                </>
              }
            />
          </div>
        }
      />

      <ReviewModal review={detail.item} open={detail.isOpen} onOpenChange={detail.setOpen} canModerate={canModerate} onDelete={(r) => (detail.close(), remove(r))} />
    </>
  );
}

function ReviewModal({
  review,
  open,
  onOpenChange,
  canModerate,
  onDelete,
}: {
  review: Review | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  canModerate: boolean;
  onDelete: (r: Review) => void;
}) {
  // live copy so approve/reply updates the modal without closing it
  const { data } = reviewHooks.useOne(open ? review?.id : null, { initialData: review ?? undefined });
  const r = data ?? review;
  const moderate = useModerateReview();
  const reply = useReplyReview();
  const { confirm } = useConfirm();
  const [draft, setDraft] = useState<string | null>(null);
  if (!r) return null;
  const text = draft ?? r.adminReply ?? "";

  const saveReply = () => reply.mutate({ id: r.id, reply: text.trim() }, { onSuccess: () => setDraft(null) });
  const removeReply = () =>
    confirm({ title: "Remove the reply?", description: "The customer and website visitors will no longer see it.", confirmText: "Remove", tone: "danger", onConfirm: () => reply.mutateAsync({ id: r.id, reply: null }).then(() => setDraft(null)) });

  return (
    <Modal
      open={open}
      onOpenChange={(o) => (o || setDraft(null), onOpenChange(o))}
      size="lg"
      title={
        <span className="flex items-center gap-3">
          Review <StatusBadge status={r.status} />
        </span>
      }
      description={`${r.service.name} · ${formatDate(r.createdAt)}`}
      footer={
        canModerate && (
          <>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto" onClick={() => onDelete(r)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            {r.status !== "rejected" && (
              <Button variant="outline" disabled={moderate.isPending} onClick={() => moderate.mutate({ id: r.id, status: "rejected" })}>
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            )}
            {r.status !== "approved" && (
              <Button disabled={moderate.isPending} onClick={() => moderate.mutate({ id: r.id, status: "approved" })}>
                <Check className="mr-2 h-4 w-4" /> Approve & publish
              </Button>
            )}
          </>
        )
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Stars value={r.rating} size="lg" />
          <span className="font-display text-2xl font-bold">{r.rating}.0</span>
        </div>
        <ReviewBody review={{ ...r, adminReply: null }} hideStars />

        <DetailList
          items={[
            { label: "Customer", value: r.user ? `${r.user.firstName} ${r.user.lastName} · ${r.user.email}` : "—" },
            { label: "Booking", value: `${r.booking.bookingNo} · ${formatDate(r.booking.bookingDate)}` },
            { label: "Last edited", value: formatDateTime(r.updatedAt) },
          ]}
        />

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareReply className="h-4 w-4 text-primary" /> Public reply
            </h3>
            {r.repliedAt && <span className="text-xs text-muted-foreground">Replied {timeAgo(r.repliedAt)}</span>}
          </div>
          {canModerate ? (
            <>
              <Textarea
                value={text}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Thank the customer or answer their concern — shown under the review on the website."
                aria-label="Reply"
              />
              <div className="flex justify-end gap-2">
                {r.adminReply && (
                  <Button variant="ghost" size="sm" onClick={removeReply}>
                    Remove reply
                  </Button>
                )}
                <Button size="sm" disabled={text.trim().length < 2 || text.trim() === (r.adminReply ?? "") || reply.isPending} onClick={saveReply}>
                  {r.adminReply ? "Update reply" : "Publish reply"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{r.adminReply ?? "No reply yet."}</p>
          )}
        </section>
      </div>
    </Modal>
  );
}
