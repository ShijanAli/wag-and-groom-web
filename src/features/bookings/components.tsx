"use client";

import { format, parse } from "date-fns";
import { CalendarDays, CircleDot, Clock, CreditCard, PawPrint, User } from "lucide-react";
import { DetailList } from "@/components/common/DetailList";
import { StatusBadge, humanize } from "@/components/common/StatusBadge";
import { fullName } from "@/lib/auth";
import { formatDateTime, formatMoney, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { METHOD_LABEL } from "@/features/payments/api";
import type { Booking, BookingPaymentStatus } from "@/types/models";

const PAYMENT_LABEL: Record<BookingPaymentStatus, string> = { unpaid: "Unpaid", partial: "Partly paid", paid: "Paid", refunded: "Refunded" };

export const bookingDay = (b: Pick<Booking, "bookingDate">, pattern = "EEE, d MMM yyyy") => format(parse(b.bookingDate, "yyyy-MM-dd", new Date()), pattern);
export const bookingWhen = (b: Pick<Booking, "bookingDate" | "startTime" | "endTime">) => `${bookingDay(b)} · ${formatTime(b.startTime)}–${formatTime(b.endTime)}`;

export function PaymentBadge({ status }: { status: BookingPaymentStatus }) {
  return <StatusBadge status={status} label={PAYMENT_LABEL[status]} />;
}

/** Booking status + payment status side by side. */
export function BookingBadges({ booking }: { booking: Pick<Booking, "status" | "paymentStatus"> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge status={booking.status} />
      {booking.status !== "cancelled" && <PaymentBadge status={booking.paymentStatus} />}
    </div>
  );
}

/** Totals block: price, discount, total, paid, due. */
export function BookingTotals({ booking }: { booking: Booking }) {
  const paid = (booking.payments ?? []).filter((p) => p.type === "payment" && p.status === "success").reduce((s, p) => s + Number(p.baseAmount), 0);
  const refunded = (booking.payments ?? []).filter((p) => p.type === "refund" && p.status === "success").reduce((s, p) => s + Number(p.baseAmount), 0);
  const due = Math.max(0, Number(booking.totalAmount) - paid);
  const rows: [string, string, string?][] = [
    ["Service price", formatMoney(booking.servicePrice)],
    ...(Number(booking.discountAmount) > 0 ? ([[`Discount${booking.promotion ? ` (${booking.promotion.code})` : ""}`, `−${formatMoney(booking.discountAmount)}`, "text-success"]] as [string, string, string][]) : []),
    ["Total", formatMoney(booking.totalAmount), "font-semibold"],
    ...(booking.payments ? ([["Paid", formatMoney(paid)]] as [string, string][]) : []),
    ...(refunded > 0 ? ([["Refunded", formatMoney(refunded)]] as [string, string][]) : []),
    ...(booking.payments && booking.status !== "cancelled" ? ([["Due", formatMoney(due), due > 0 ? "font-semibold text-destructive" : "text-success"]] as [string, string, string][]) : []),
  ];
  return (
    <dl className="space-y-1.5 rounded-xl bg-muted/50 p-4 text-sm">
      {rows.map(([label, value, cls]) => (
        <div key={label} className={cn("flex justify-between", cls)}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Vertical status history (from statusLogs). */
export function BookingTimeline({ booking }: { booking: Booking }) {
  if (!booking.statusLogs?.length) return null;
  return (
    <ol className="relative space-y-4 border-l pl-5">
      {booking.statusLogs.map((log) => (
        <li key={log.id} className="relative">
          <CircleDot className="absolute -left-[27px] top-0.5 h-4 w-4 bg-background text-primary" />
          <p className="text-sm font-medium">{humanize(log.toStatus)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(log.createdAt)}
            {log.changedBy && ` · ${fullName(log.changedBy)}`}
          </p>
          {log.note && <p className="mt-1 text-sm text-muted-foreground">“{log.note}”</p>}
        </li>
      ))}
    </ol>
  );
}

export function BookingPaymentsList({ booking }: { booking: Booking }) {
  const lines = booking.payments ?? [];
  if (!lines.length) return <p className="text-sm text-muted-foreground">No payments yet.</p>;
  return (
    <ul className="divide-y rounded-xl border">
      {lines.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
          <div className="min-w-0">
            <p className="font-medium">
              {p.type === "refund" ? "Refund" : METHOD_LABEL[p.method]} · {formatMoney(p.amount, p.currency)}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">{p.transactionId}</p>
          </div>
          <div className="shrink-0 text-right">
            <StatusBadge status={p.status} />
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(p.paidAt ?? p.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Full booking detail used in the customer modal and the admin side panel. */
export function BookingDetail({ booking, showCustomer = false }: { booking: Booking; showCustomer?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-sm font-semibold">{booking.bookingNo}</p>
        <BookingBadges booking={booking} />
      </div>
      <DetailList
        items={[
          { label: "Service", value: booking.service.name },
          { label: "Pet", value: `${booking.pet.name} (${booking.pet.petType.name})` },
          { label: "When", value: bookingWhen(booking), full: true },
          { label: "Staff", value: booking.assignedStaff ? fullName(booking.assignedStaff) : "Not assigned" },
          ...(showCustomer && booking.user
            ? [{ label: "Customer", value: `${fullName(booking.user)} · ${booking.user.phone ?? booking.user.email}` }]
            : [{ label: "Booked on", value: formatDateTime(booking.createdAt) }]),
          ...(booking.customerNote ? [{ label: "Customer note", value: booking.customerNote, full: true }] : []),
          ...(booking.cancelReason ? [{ label: "Cancellation reason", value: booking.cancelReason, full: true }] : []),
        ]}
      />
      <BookingTotals booking={booking} />
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payments</h3>
        <BookingPaymentsList booking={booking} />
      </section>
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">History</h3>
        <BookingTimeline booking={booking} />
      </section>
    </div>
  );
}

/** Compact facts row used on booking cards. */
export function BookingFacts({ booking, showCustomer }: { booking: Booking; showCustomer?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <li className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" /> {bookingDay(booking, "EEE, d MMM")}
      </li>
      <li className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> {formatTime(booking.startTime)}–{formatTime(booking.endTime)}
      </li>
      <li className="flex items-center gap-1.5">
        <PawPrint className="h-3.5 w-3.5" /> {booking.pet.name}
      </li>
      {showCustomer && booking.user ? (
        <li className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" /> {fullName(booking.user)}
        </li>
      ) : (
        booking.assignedStaff && (
          <li className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {booking.assignedStaff.firstName}
          </li>
        )
      )}
      <li className="flex items-center gap-1.5">
        <CreditCard className="h-3.5 w-3.5" /> {formatMoney(booking.totalAmount)}
      </li>
    </ul>
  );
}
