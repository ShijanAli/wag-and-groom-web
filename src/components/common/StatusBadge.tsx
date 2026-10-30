import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const TONES: Record<Tone, string> = {
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/15 text-amber-700 ring-warning/30 dark:text-warning",
  danger: "bg-destructive/10 text-destructive ring-destructive/25",
  info: "bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-400",
  neutral: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary/10 text-primary ring-primary/25",
};

/**
 * Every backend status in one map, so a status looks the same on every page.
 * Unknown values fall back to neutral.
 */
const STATUS_TONE: Record<string, Tone> = {
  // ActiveStatus / UserStatus
  active: "success",
  inactive: "neutral",
  blocked: "danger",
  // BookingStatus
  pending: "warning",
  confirmed: "info",
  in_progress: "primary",
  completed: "success",
  cancelled: "danger",
  no_show: "danger",
  // PaymentStatus
  unpaid: "warning",
  partial: "info",
  paid: "success",
  refunded: "neutral",
  // TransactionStatus
  success: "success",
  failed: "danger",
  // ReviewStatus / ApplicationStatus
  approved: "success",
  rejected: "danger",
  under_review: "info",
  // AdoptionPetStatus
  available: "success",
  adopted: "info",
  on_hold: "neutral",
  // PostStatus
  draft: "neutral",
  published: "success",
  // ContactStatus
  new: "primary",
  read: "neutral",
  replied: "success",
  // SubscriptionStatus
  subscribed: "success",
  unsubscribed: "neutral",
};

export const humanize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function StatusBadge({
  status,
  tone,
  label,
  className,
}: {
  status: string;
  tone?: Tone;
  label?: React.ReactNode;
  className?: string;
}) {
  const t = tone ?? STATUS_TONE[status] ?? "neutral";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", TONES[t], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label ?? humanize(status)}
    </span>
  );
}
