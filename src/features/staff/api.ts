"use client";

import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/common/form/fields";
import { createKeys, createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { Id, ListParams } from "@/lib/api/types";
import { userHooks } from "@/features/users/api";
import type { BlockedDate, Role, StaffMember, StaffSchedule } from "@/types/models";

export const staffKeys = createKeys("staff");

export const staffApi = {
  list: (params?: ListParams) => api.list<StaffMember>("/staff", params),
  setSchedules: (id: Id, schedules: Omit<StaffSchedule, "id">[]) => api.put<StaffSchedule[]>(`/staff/${id}/schedules`, { schedules }),
};

export const useStaffList = (params: ListParams) =>
  useQuery({ queryKey: staffKeys.list(params), queryFn: () => staffApi.list(params), placeholderData: (prev) => prev });

/** Staff for selects (service providers, days off). */
export const useStaffOptions = () =>
  useQuery({
    queryKey: staffKeys.list({ limit: 100 }),
    queryFn: () => staffApi.list({ limit: 100 }),
    staleTime: 5 * 60_000,
    select: (r): Option<number>[] => r.data.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}`, disabled: s.status !== "active" })),
  });

export const useSetSchedules = () =>
  useApiMutation(({ id, schedules }: { id: Id; schedules: Omit<StaffSchedule, "id">[] }) => staffApi.setSchedules(id, schedules), {
    invalidate: [staffKeys.all],
    successMessage: "Working hours saved",
  });

/** Staff accounts are users with the `staff` role → created through /users. */
export const useStaffRoleId = () =>
  useQuery({
    queryKey: ["roles", "list", { limit: 50 }],
    queryFn: () => api.list<Role>("/roles", { limit: 50 }),
    staleTime: 10 * 60_000,
    select: (r) => r.data.find((role) => role.slug === "staff")?.id,
  });

/** Any change to a staff user also refreshes the staff list (and vice versa). */
export const staffInvalidate = [staffKeys.all, userHooks.keys.all];

/* ───────────────────────── blocked dates (holidays / days off) ───────────────────────── */

export interface BlockedDateInput {
  staffId: number | null;
  date: string;
  reason?: string | null;
}

export const blockedDatesApi = createResource<BlockedDate, BlockedDateInput, { date?: string; reason?: string | null }>("/blocked-dates");
export const blockedDateHooks = createResourceHooks("blocked-dates", blockedDatesApi);

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
};

/** Bangladesh week order: Saturday first. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];
const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Weekly hours as short lines, merging consecutive days with the same hours:
 * ["Sat–Wed · 9am–6pm", "Thu · 10am–2pm"]
 */
export function summarizeSchedule(schedules: StaffSchedule[]): string[] {
  const active = new Map(schedules.filter((s) => s.isActive).map((s) => [s.dayOfWeek, `${fmtTime(s.startTime)}–${fmtTime(s.endTime)}`]));
  const lines: string[] = [];
  let run: number[] = [];
  const flush = () => {
    if (!run.length) return;
    const days = run.length > 1 ? `${SHORT[run[0]]}–${SHORT[run[run.length - 1]]}` : SHORT[run[0]];
    lines.push(`${days} · ${active.get(run[0])}`);
    run = [];
  };
  for (const d of WEEK_ORDER) {
    const hours = active.get(d);
    if (!hours) flush();
    else if (run.length && active.get(run[0]) !== hours) (flush(), run.push(d));
    else run.push(d);
  }
  flush();
  return lines;
}

export interface MySchedule {
  staff: { id: number; firstName: string; lastName: string };
  schedules: StaffSchedule[];
  upcomingBlockedDates: BlockedDate[];
}

/** The signed-in staff member's own week + upcoming days off. */
export const useMySchedule = () =>
  useQuery({ queryKey: ["staff", "me", "schedule"], queryFn: () => api.get<MySchedule>("/staff/me/schedule"), staleTime: 5 * 60_000 });
