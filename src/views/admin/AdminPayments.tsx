"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Undo2 } from "lucide-react";
import { DataTable, DataTableToolbar, RowActions, TableDateRange, TableFilter } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { METHOD_LABEL, METHOD_OPTIONS, refundable, usePayments } from "@/features/payments/api";
import { RefundModal } from "@/features/payments/PaymentModals";
import type { Payment } from "@/types/models";

const STATUS = ["success", "pending", "failed", "cancelled", "refunded"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const TYPES = [
  { value: "payment", label: "Payments" },
  { value: "refund", label: "Refunds" },
];

export default function AdminPayments() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = usePayments(list.params);
  const refund = useDisclosure<Payment>();
  const canRefund = can(P.PAYMENT.REFUND);

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      { id: "createdAt", header: "Date", enableSorting: true, cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.paidAt ?? row.original.createdAt)}</span> },
      { id: "user", header: "Customer", cell: ({ row }) => (row.original.user ? <UserCell user={row.original.user} secondary={row.original.user.email} /> : "—") },
      {
        id: "for",
        header: "For",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.booking?.bookingNo ?? (row.original.adoption ? `Adoption #${row.original.adoption.id}` : "—")}</span>,
      },
      {
        id: "method",
        header: "Method",
        cell: ({ row }) => (
          <div>
            <p>{row.original.type === "refund" ? "Refund" : METHOD_LABEL[row.original.method]}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{row.original.transactionId}</p>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        enableSorting: true,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="whitespace-nowrap">
              <p className={cn("font-semibold", p.type === "refund" && "text-destructive")}>
                {p.type === "refund" ? "−" : ""}
                {formatMoney(p.amount, p.currency)}
              </p>
              {p.currency !== "BDT" && <p className="text-xs text-muted-foreground">≈ {formatMoney(p.baseAmount)}</p>}
            </div>
          );
        },
      },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const p = row.original;
          return (
            <RowActions
              actions={[
                { label: "Refund", icon: Undo2, onClick: () => refund.open(p), visible: canRefund && p.type === "payment" && p.status === "success" && refundable(p) > 0 },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canRefund],
  );

  return (
    <>
      <PageHeader title="Payments" description="Online and counter payments, and refunds. Amounts in BDT unless marked." />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No payments yet"
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Transaction ID or booking no.…"
            filters={
              <>
                <TableFilter list={list} param="type" options={TYPES} allLabel="Payments & refunds" placeholder="Type" />
                <TableFilter list={list} param="status" options={STATUS} allLabel="All statuses" placeholder="Status" />
                <TableFilter list={list} param="method" options={METHOD_OPTIONS} allLabel="All methods" placeholder="Method" />
                <TableDateRange list={list} />
              </>
            }
          />
        }
      />
      <RefundModal payment={refund.item} open={refund.isOpen} onOpenChange={refund.setOpen} />
    </>
  );
}
