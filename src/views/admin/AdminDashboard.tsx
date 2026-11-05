"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, subDays, subMonths, startOfMonth } from "date-fns";
import { ArrowRight, CalendarCheck, CalendarDays, ClipboardList, HeartHandshake, Inbox, Star, Users, Wallet } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { fullName } from "@/lib/auth";
import { formatMoney, formatTime, toApiDate } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_OPTIONS, useAdminBookings } from "@/features/bookings/api";
import { BookingValueChart } from "@/features/system/BookingValueChart";
import { useBookingValue, useBookingsByStatus, useDashboardStats, useTopServices } from "@/features/system/api";
import type { BookingStatus } from "@/types/models";

const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "12m", label: "12 months" },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

/** Range ending today (inclusive). 12m = month buckets, the rest = day buckets. */
function rangeFor(key: RangeKey) {
  const to = new Date();
  if (key === "12m") return { from: toApiDate(startOfMonth(subMonths(to, 11))), to: toApiDate(to), groupBy: "month" as const };
  const days = { "7d": 6, "30d": 29, "90d": 89 }[key];
  return { from: toApiDate(subDays(to, days)), to: toApiDate(to), groupBy: "day" as const };
}

export default function AdminDashboard() {
  const { user, can } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const rangeKey = (RANGES.find((r) => r.key === sp.get("range"))?.key ?? "30d") as RangeKey;
  const range = useMemo(() => rangeFor(rangeKey), [rangeKey]);
  const { from, to } = range;

  const stats = useDashboardStats();
  const value = useBookingValue(range);
  const byStatus = useBookingsByStatus({ from, to });
  const top = useTopServices({ from, to });
  const s = stats.data;

  const setRange = (key: RangeKey) => router.replace(key === "30d" ? pathname : `${pathname}?range=${key}`, { scroll: false });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const attention = [
    { label: "Bookings awaiting confirmation", count: s?.bookings.pending, href: "/admin/bookings?status=pending", icon: CalendarDays, show: can(P.BOOKING.VIEW) },
    { label: "Reviews to moderate", count: s?.reviews.pending, href: "/admin/reviews", icon: Star, show: can(P.REVIEW.VIEW) },
    { label: "Adoption applications to review", count: s?.adoption.pendingApplications, href: "/admin/adoption-applications?status=pending", icon: ClipboardList, show: can(P.ADOPTION_APPLICATION.VIEW) },
    { label: "Unread messages", count: s?.inbox.newMessages, href: "/admin/messages?status=new", icon: Inbox, show: can(P.CONTACT.VIEW) },
  ].filter((a) => a.show);

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.firstName ?? ""}`}
        description={format(new Date(), "EEEE, d MMMM yyyy")}
        actions={
          <div role="tablist" aria-label="Report period" className="inline-flex rounded-xl bg-muted p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={rangeKey === r.key}
                onClick={() => setRange(r.key)}
                className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition", rangeKey === r.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPIs (always "now", independent of the chart period) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Booking value this month"
          icon={Wallet}
          loading={!s}
          value={s && formatMoney(s.bookingValue.thisMonth)}
          trend={s?.bookingValue.growthPercent}
          hint={s && `completed bookings · vs ${formatMoney(s.bookingValue.lastMonth)} last month`}
          href={can(P.BOOKING.VIEW) ? "/admin/bookings?status=completed" : undefined}
        />
        <StatCard
          label="Bookings today"
          icon={CalendarCheck}
          loading={!s}
          value={s?.bookings.today}
          hint={s && `${s.bookings.upcoming} upcoming · ${s.bookings.completedThisMonth} done this month`}
          href={can(P.BOOKING.VIEW) ? `/admin/bookings?from=${toApiDate(new Date())}&to=${toApiDate(new Date())}` : undefined}
        />
        <StatCard
          label="Customers"
          icon={Users}
          loading={!s}
          value={s?.users.customers.toLocaleString("en-IN")}
          hint={s && `+${s.users.newCustomersThisMonth} this month · ${s.users.staff} staff`}
          href={can(P.USER.VIEW) ? "/admin/customers" : undefined}
        />
        <StatCard
          label="Pets for adoption"
          icon={HeartHandshake}
          loading={!s}
          value={s?.adoption.availablePets}
          hint={s && `${s.adoption.inProgress} in progress · ${s.adoption.completedThisMonth} adopted this month`}
          href={can(P.ADOPTION.VIEW) ? "/admin/adoptions" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription>Completed booking value · {RANGES.find((r) => r.key === rangeKey)!.label}</CardDescription>
            <CardTitle className="font-display text-3xl tabular-nums">{value.data ? formatMoney(value.data.total) : <Skeleton className="h-9 w-40" />}</CardTitle>
          </CardHeader>
          <CardContent className={cn(value.isPlaceholderData && "opacity-60 transition-opacity")}>
            {value.data ? <BookingValueChart report={value.data} /> : <Skeleton className="h-80 w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Needs your attention</CardTitle>
            <CardDescription>Things waiting on the team right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.map((a) => (
              <Link key={a.label} href={a.href} className="group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition hover:border-primary/40 hover:bg-muted/50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <a.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                </span>
                <span className="flex-1 text-sm">{a.label}</span>
                {a.count === undefined ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <span className={cn("min-w-8 rounded-full px-2 py-0.5 text-center text-sm font-semibold tabular-nums", a.count ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {a.count}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ))}
            {s?.reviews.averageRating ? (
              <p className="flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden /> Average rating {s.reviews.averageRating.toFixed(1)} · {s.inbox.subscribers} newsletter subscribers
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings by status</CardTitle>
            <CardDescription>Appointment dates in the selected period.</CardDescription>
          </CardHeader>
          <CardContent>{byStatus.data ? <StatusBars data={byStatus.data} from={from} to={to} /> : <Skeleton className="h-48 w-full" />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top services</CardTitle>
            <CardDescription>Most booked in the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            {!top.data ? (
              <Skeleton className="h-48 w-full" />
            ) : !top.data.length ? (
              <EmptyState title="No bookings in this period" className="py-8" />
            ) : (
              <ol className="space-y-3">
                {top.data.map((t, i) => {
                  const max = top.data[0].bookings || 1;
                  return (
                    <li key={t.service.id} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate">
                          <span className="mr-2 text-muted-foreground tabular-nums">{i + 1}.</span>
                          {t.service.name}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          <strong>{t.bookings}</strong> <span className="text-muted-foreground">· {formatMoney(t.bookedValue)}</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted" aria-hidden>
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(t.bookings / max) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        {can(P.BOOKING.VIEW) && <TodaySchedule />}
      </div>
    </>
  );
}

/** One row per status: label (status badge carries identity) + count + share bar in a single neutral hue. */
function StatusBars({ data, from, to }: { data: Record<BookingStatus, number>; from: string; to: string }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (!total) return <EmptyState title="No bookings in this period" className="py-8" />;
  return (
    <ul className="space-y-3">
      {BOOKING_STATUS_OPTIONS.map((o) => {
        const n = data[o.value] ?? 0;
        return (
          <li key={o.value}>
            <Link href={`/admin/bookings?status=${o.value}&from=${from}&to=${to}`} className="group block space-y-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex items-center justify-between text-sm">
                <StatusBadge status={o.value} label={o.label} />
                <span className="tabular-nums">
                  <strong>{n}</strong> <span className="text-muted-foreground">· {Math.round((n / total) * 100)}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full bg-foreground/70 transition-all group-hover:bg-foreground" style={{ width: `${(n / total) * 100}%` }} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function TodaySchedule() {
  const today = toApiDate(new Date());
  // the API can't sort by start time → take the day (rarely > 50) and order it here
  const q = useAdminBookings({ from: today, to: today, limit: 50, sortBy: "bookingDate", sortOrder: "asc" });
  const rows = useMemo(() => [...(q.data?.data ?? [])].filter((b) => b.status !== "cancelled").sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 6), [q.data]);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">Today&apos;s schedule</CardTitle>
          <CardDescription>{q.data ? `${q.data.meta.total} appointment${q.data.meta.total === 1 ? "" : "s"}` : "Loading…"}</CardDescription>
        </div>
        <Link href={`/admin/bookings?from=${today}&to=${today}`} className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {q.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : !rows.length ? (
          <EmptyState icon={CalendarDays} title="Nothing booked today" className="py-8" />
        ) : (
          <ul className="divide-y">
            {rows.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-16 shrink-0 font-semibold tabular-nums">{formatTime(b.startTime)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {b.pet.name} · {b.service.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {b.user ? fullName(b.user) : "—"}
                    {b.assignedStaff && ` · with ${b.assignedStaff.firstName}`}
                  </span>
                </span>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
