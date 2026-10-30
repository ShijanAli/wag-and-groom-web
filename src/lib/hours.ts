import type { OpeningDay } from "@/types/models";

/** Same default as the backend `opening_hours` setting. */
export const DEFAULT_OPENING_HOURS: OpeningDay[] = [0, 1, 2, 3, 4, 5, 6].map((day) =>
  day === 0 ? { day, open: true, opens: "09:00", closes: "17:00" } : { day, open: true, opens: "08:00", closes: "19:00" },
);

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const SCHEMA_DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Display order: Saturday-first week (Bangladesh). */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

/** "08:00" → "8 AM", "19:30" → "7:30 PM" */
export function clock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

const hoursKey = (d: OpeningDay) => (d.open ? `${d.opens}-${d.closes}` : "closed");

/** [6,0,1] → "Sat–Mon"; [6,1] → "Sat, Mon" (runs of 3+ collapse to a range) */
function dayLabel(days: number[]) {
  const pos = days.map((d) => WEEK_ORDER.indexOf(d as (typeof WEEK_ORDER)[number])).sort((a, b) => a - b);
  const runs: number[][] = [];
  for (const p of pos) {
    const last = runs.at(-1);
    if (last && p === last[last.length - 1] + 1) last.push(p);
    else runs.push([p]);
  }
  return runs
    .flatMap((r) => (r.length >= 3 ? [`${DAY_SHORT[WEEK_ORDER[r[0]]]}–${DAY_SHORT[WEEK_ORDER[r[r.length - 1]]]}`] : r.map((p) => DAY_SHORT[WEEK_ORDER[p]])))
    .join(", ");
}

/** Days with the same hours grouped: [{ label: "Sat–Thu", value: "8 AM – 7 PM" }, { label: "Fri", value: "Closed" }] */
export function groupHours(week: OpeningDay[] | undefined) {
  const days = week?.length === 7 ? week : DEFAULT_OPENING_HOURS;
  const groups = new Map<string, number[]>();
  for (const d of WEEK_ORDER.map((n) => days.find((x) => x.day === n)!)) {
    groups.set(hoursKey(d), [...(groups.get(hoursKey(d)) ?? []), d.day]);
  }
  return [...groups.entries()].map(([key, ds]) => {
    const d = days.find((x) => x.day === ds[0])!;
    return { label: dayLabel(ds), value: key === "closed" ? "Closed" : `${clock(d.opens)} – ${clock(d.closes)}` };
  });
}

/** Current weekday + "HH:mm" in the business time zone, whatever the visitor's clock says. */
function nowInDhaka(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: DAY_SHORT.indexOf(get("weekday") as (typeof DAY_SHORT)[number]), time: `${get("hour")}:${get("minute")}` };
}

/** "Open now · until 7 PM" / "Closed · opens Sat 8 AM" */
export function openStatus(week: OpeningDay[] | undefined, now = new Date()) {
  const days = week?.length === 7 ? week : DEFAULT_OPENING_HOURS;
  const { day, time } = nowInDhaka(now);
  const today = days.find((d) => d.day === day);
  if (today?.open && time >= today.opens && time < today.closes) return { open: true, label: `Open now · until ${clock(today.closes)}` };
  for (let i = 0; i < 7; i++) {
    const d = days.find((x) => x.day === (day + i) % 7);
    if (!d?.open || (i === 0 && time >= d.opens)) continue;
    return { open: false, label: `Closed · opens ${i === 0 ? "today" : i === 1 ? "tomorrow" : DAY_SHORT[d.day]} ${clock(d.opens)}` };
  }
  return { open: false, label: "Closed" };
}

/** schema.org openingHoursSpecification (closed days omitted). */
export const openingHoursJsonLd = (week: OpeningDay[] | undefined) =>
  (week?.length === 7 ? week : DEFAULT_OPENING_HOURS)
    .filter((d) => d.open)
    .map((d) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAY[d.day], opens: d.opens, closes: d.closes }));
