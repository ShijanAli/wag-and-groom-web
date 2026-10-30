"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarClock, CalendarDays, CheckCheck, Clock, Eye, PawPrint, Phone, PlayCircle, StickyNote } from "lucide-react";
import { DataTablePagination } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { PanelHeader } from "@/components/common/PanelHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useListParams } from "@/hooks/use-list-params";
import { useTabParam } from "@/hooks/use-tab-param";
import { fullName } from "@/lib/auth";
import { formatDay, formatTime, toApiDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "@/features/auth/ProfileSettings";
import { NotificationsCenter } from "@/features/notifications/NotificationsCenter";
import { useStaffBookings } from "@/features/bookings/api";
import { BookingBadges, BookingDetail, bookingDay } from "@/features/bookings/components";
import { StatusActions } from "@/features/bookings/StatusActions";
import { WEEKDAYS, WEEK_ORDER, useMySchedule } from "@/features/staff/api";
import type { Booking } from "@/types/models";

const TABS = ["today", "upcoming", "history", "schedule", "notifications", "profile"] as const;

export default function StaffDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useTabParam(TABS, "today");
  const [detail, setDetail] = useState<Booking | null>(null);

  return (
    <div className="min-h-screen bg-muted/30">
      <PanelHeader home="/staff" badge="Staff panel" profileHref="/staff?tab=profile" />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Good {greeting()}, {user?.firstName}</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>

        <Stats />

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="schedule">My hours</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="today">{tab === "today" && <AppointmentList scope="today" onOpen={setDetail} />}</TabsContent>
          <TabsContent value="upcoming">{tab === "upcoming" && <AppointmentList scope="upcoming" onOpen={setDetail} />}</TabsContent>
          <TabsContent value="history">{tab === "history" && <AppointmentList scope="history" onOpen={setDetail} />}</TabsContent>
          <TabsContent value="schedule">{tab === "schedule" && <MyHours />}</TabsContent>
          <TabsContent value="notifications">{tab === "notifications" && <NotificationsCenter />}</TabsContent>
          <TabsContent value="profile">{tab === "profile" && <ProfileSettings />}</TabsContent>
        </Tabs>
      </main>

      <Modal open={!!detail} onOpenChange={(o) => !o && setDetail(null)} title="Appointment" size="lg">
        {detail && <BookingDetail booking={detail} showCustomer />}
      </Modal>
    </div>
  );
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
};

function Stats() {
  const today = toApiDate(new Date());
  const day = { from: today, to: today, limit: 1 };
  const todayAll = useStaffBookings(day);
  const inProgress = useStaffBookings({ ...day, status: "in_progress" });
  const done = useStaffBookings({ ...day, status: "completed" });
  const upcoming = useStaffBookings({ from: today, status: "confirmed", limit: 1 });
  const items = [
    { label: "Today", value: todayAll.data?.meta.total, icon: CalendarDays, tone: "bg-primary/10 text-primary" },
    { label: "In progress", value: inProgress.data?.meta.total, icon: PlayCircle, tone: "bg-sky-500/10 text-sky-600" },
    { label: "Done today", value: done.data?.meta.total, icon: CheckCheck, tone: "bg-success/10 text-success" },
    { label: "Confirmed ahead", value: upcoming.data?.meta.total, icon: CalendarClock, tone: "bg-secondary/10 text-secondary" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((i) => (
        <Card key={i.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", i.tone)}>
              <i.icon className="h-5 w-5" />
            </span>
            <div>
              {i.value === undefined ? <Skeleton className="mb-1 h-7 w-8" /> : <p className="text-2xl font-bold">{i.value}</p>}
              <p className="text-xs text-muted-foreground">{i.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AppointmentList({ scope, onOpen }: { scope: "today" | "upcoming" | "history"; onOpen: (b: Booking) => void }) {
  const list = useListParams({ defaults: { limit: 10 } });
  const today = toApiDate(new Date());
  const tomorrow = toApiDate(new Date(Date.now() + 864e5));
  const range =
    scope === "today"
      ? { from: today, to: today, sortBy: "bookingDate", sortOrder: "asc" as const }
      : scope === "upcoming"
        ? { from: tomorrow, sortBy: "bookingDate", sortOrder: "asc" as const }
        : { to: today, sortBy: "bookingDate", sortOrder: "desc" as const };
  const query = useStaffBookings({ ...list.params, ...range });
  const rows = sortByTime(query.data?.data ?? [], range.sortOrder);

  if (query.isPending) return <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;
  if (!rows.length)
    return (
      <EmptyState
        icon={CalendarDays}
        title={scope === "today" ? "Nothing booked for today" : scope === "upcoming" ? "No upcoming appointments" : "No past appointments"}
        description={scope === "today" ? "Enjoy the calm — new bookings show up here automatically." : undefined}
        className="bg-card"
      />
    );

  return (
    <div className={cn("space-y-3 transition-opacity", query.isFetching && "opacity-60")}>
      {rows.map((b) => (
        <Card key={b.id} className={cn(b.status === "in_progress" && "border-sky-500/50 ring-1 ring-sky-500/20")}>
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
            <div className="flex w-24 shrink-0 flex-col md:items-center md:text-center">
              <span className="text-lg font-bold">{formatTime(b.startTime)}</span>
              <span className="text-xs text-muted-foreground">{scope === "today" ? `until ${formatTime(b.endTime)}` : bookingDay(b, "EEE, d MMM")}</span>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{b.service.name}</h3>
                <BookingBadges booking={b} />
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <PawPrint className="h-3.5 w-3.5" /> {b.pet.name} · {b.pet.petType.name}
                </li>
                {b.user && <li>{fullName(b.user)}</li>}
                {b.user?.phone && (
                  <li>
                    <a href={`tel:${b.user.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                      <Phone className="h-3.5 w-3.5" /> {b.user.phone}
                    </a>
                  </li>
                )}
                <li className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {b.service.durationMinutes} min
                </li>
              </ul>
              {b.customerNote && (
                <p className="flex items-start gap-1.5 rounded-lg bg-warning/10 px-3 py-2 text-sm">
                  <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /> {b.customerNote}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => onOpen(b)} aria-label={`Details ${b.bookingNo}`}>
                <Eye className="h-4 w-4" />
              </Button>
              <StatusActions booking={b} />
            </div>
          </CardContent>
        </Card>
      ))}
      {query.data && query.data.meta.totalPages > 1 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <DataTablePagination meta={query.data.meta} onChange={list.setParams} />
        </div>
      )}
    </div>
  );
}

/** The API sorts by date; order same-day appointments by start time too. */
const sortByTime = (rows: Booking[], order: "asc" | "desc") =>
  [...rows].sort((a, b) => {
    const k = `${a.bookingDate} ${a.startTime}`.localeCompare(`${b.bookingDate} ${b.startTime}`);
    return order === "asc" ? k : -k;
  });

function MyHours() {
  const q = useMySchedule();
  if (q.isPending) return <Skeleton className="h-72 rounded-xl" />;
  const byDay = new Map((q.data?.schedules ?? []).filter((s) => s.isActive).map((s) => [s.dayOfWeek, s]));
  const today = new Date().getDay();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="divide-y p-0">
          {WEEK_ORDER.map((d) => {
            const s = byDay.get(d);
            return (
              <div key={d} className={cn("flex items-center justify-between px-5 py-3.5 text-sm", d === today && "bg-primary/5")}>
                <span className="font-medium">
                  {WEEKDAYS[d]} {d === today && <span className="ml-1 text-xs text-primary">(today)</span>}
                </span>
                <span className={s ? "font-medium" : "text-muted-foreground"}>{s ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}` : "Day off"}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="font-semibold">Upcoming days off</h3>
          {q.data?.upcomingBlockedDates.length ? (
            <ul className="space-y-2 text-sm">
              {q.data.upcomingBlockedDates.map((b) => (
                <li key={b.id} className="flex justify-between gap-3">
                  <span>{formatDay(b.date, "EEE, d MMM")}</span>
                  <span className="truncate text-muted-foreground">{b.staffId ? b.reason ?? "Leave" : `Closed${b.reason ? ` · ${b.reason}` : ""}`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">None scheduled.</p>
          )}
          <p className="text-xs text-muted-foreground">Hours are managed by your admin.</p>
        </CardContent>
      </Card>
    </div>
  );
}
