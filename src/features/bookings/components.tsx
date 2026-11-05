"use client";

import { format, parse } from "date-fns";
import { Banknote, CalendarDays, CircleDot, Clock, PawPrint, User } from "lucide-react";
import { DetailList } from "@/components/common/DetailList";
import { StatusBadge, humanize } from "@/components/common/StatusBadge";
import { fullName } from "@/lib/auth";
import { formatDateTime, formatMoney, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/models";

export const bookingDay = (b: Pick<Booking, "bookingDate">, pattern = "EEE, d MMM yyyy") => format(parse(b.bookingDate, "yyyy-MM-dd", new Date()), pattern);
export const bookingWhen = (b: Pick<Booking, "bookingDate" | "startTime" | "endTime">) => `${bookingDay(b)} · ${formatTime(b.startTime)}–${formatTime(b.endTime)}`;

/** Booking status badge. */
export function BookingBadges({ booking }: { booking: Pick<Booking, "status"> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge status={booking.status} />
    </div>
  );
}

/** Totals block: price, discount, total. */
export function BookingTotals({ booking }: { booking: Booking }) {
  const rows: [string, string, string?][] = [
    ["Service price", formatMoney(booking.servicePrice)],
    ...(Number(booking.discountAmount) > 0 ? ([[`Discount${booking.promotion ? ` (${booking.promotion.code})` : ""}`, `−${formatMoney(booking.discountAmount)}`, "text-success"]] as [string, string, string][]) : []),
    ["Total", formatMoney(booking.totalAmount), "font-semibold"],
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
        <Banknote className="h-3.5 w-3.5" /> {formatMoney(booking.totalAmount)}
      </li>
    </ul>
  );
}
