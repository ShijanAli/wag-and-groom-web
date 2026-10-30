"use client";

import type { UseListParams } from "@/hooks/use-list-params";
import { cn } from "@/lib/utils";

/**
 * Pill tabs bound to one list param — for the 3–5 statuses an inbox/moderation queue
 * is mostly viewed by ("Pending · Approved · Rejected · All").
 */
export function TableTabs({
  list,
  param = "status",
  options,
  allLabel = "All",
  className,
}: {
  list: UseListParams;
  param?: string;
  options: { label: React.ReactNode; value: string }[];
  allLabel?: string | false;
  className?: string;
}) {
  const value = (list.params[param] as string | undefined) ?? "all";
  const tabs = allLabel === false ? options : [...options, { label: allLabel, value: "all" }];
  return (
    <div role="tablist" aria-label="Filter" className={cn("inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1", className)}>
      {tabs.map((t) => {
        const selected = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => list.setParams({ [param]: t.value === "all" ? undefined : t.value })}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
              selected ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
