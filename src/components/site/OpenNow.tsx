"use client";

import { useEffect, useState } from "react";
import { openStatus } from "@/lib/hours";
import { cn } from "@/lib/utils";
import type { OpeningDay } from "@/types/models";

/**
 * "Open now · until 7 PM" / "Closed · opens tomorrow 8 AM", from the admin's opening hours (Dhaka time).
 * Computed after mount (it depends on the visitor's current time → would mismatch the cached HTML) and re-checked every minute.
 */
export function OpenNow({ week, className }: { week: OpeningDay[]; className?: string }) {
  const [status, setStatus] = useState<ReturnType<typeof openStatus> | null>(null);
  useEffect(() => {
    const tick = () => setStatus(openStatus(week));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [week]);
  if (!status) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 rounded-full", status.open ? "bg-success" : "bg-muted-foreground/60")} aria-hidden />
      {status.label}
    </span>
  );
}
