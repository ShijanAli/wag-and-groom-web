/**
 * Display formatting. The API sends money as Decimal strings in BDT and
 * timestamps as ISO strings; booking dates are "YYYY-MM-DD" and times "HH:mm"
 * in the business timezone (Asia/Dhaka).
 */
import { format, formatDistanceToNowStrict, isValid, parse, parseISO } from "date-fns";

export type Currency = "BDT" | "USD";

const moneyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: string | number | null | undefined, currency: Currency = "BDT"): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "—";
  let f = moneyFormatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat(currency === "BDT" ? "en-BD" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    moneyFormatters.set(currency, f);
  }
  return f.format(n);
}

const toDate = (v: string | Date) => (typeof v === "string" ? parseISO(v) : v);

export function formatDate(value: string | Date | null | undefined, pattern = "d MMM yyyy"): string {
  if (!value) return "—";
  const d = toDate(value);
  return isValid(d) ? format(d, pattern) : "—";
}

export const formatDateTime = (value: string | Date | null | undefined) => formatDate(value, "d MMM yyyy, h:mm a");

export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = toDate(value);
  return isValid(d) ? `${formatDistanceToNowStrict(d)} ago` : "—";
}

/** "14:30" → "2:30 PM" */
export function formatTime(hhmm: string | null | undefined): string {
  if (!hhmm) return "—";
  const d = parse(hhmm, "HH:mm", new Date());
  return isValid(d) ? format(d, "h:mm a") : hhmm;
}

/** Minutes → "1h 30m" */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ");
}

/** Date → "YYYY-MM-DD" in local time (what the API expects for booking dates). */
export const toApiDate = (d: Date) => format(d, "yyyy-MM-dd");
