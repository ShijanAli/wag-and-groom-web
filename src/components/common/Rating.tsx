"use client";

import { memo, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChoiceShell } from "./form/choice-fields";

const SIZES = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-6 w-6" } as const;

/** Read-only stars. Half values round to the nearest star. */
export const Stars = memo(function Stars({ value, size = "md", className }: { value: number; size?: keyof typeof SIZES; className?: string }) {
  const filled = Math.round(value);
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn(SIZES[size], i < filled ? "fill-warning text-warning" : "fill-muted text-muted")} aria-hidden />
      ))}
    </span>
  );
});

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Clickable 1–5 stars with hover preview (radio group for a11y). */
export function RatingInput({ value, onChange, disabled }: { value: number | undefined; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value || 0;
  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            disabled={disabled}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
          >
            <Star className={cn("h-8 w-8 transition-colors", n <= shown ? "fill-warning text-warning" : "fill-transparent text-muted-foreground/40")} />
          </button>
        ))}
      </div>
      <span className="min-w-[5rem] text-sm font-medium text-muted-foreground">{LABELS[shown]}</span>
    </div>
  );
}

export function RatingField(props: { name: string; label?: string; required?: boolean; description?: string }) {
  return <ChoiceShell {...props}>{(value, onChange) => <RatingInput value={value as number | undefined} onChange={onChange} />}</ChoiceShell>;
}

/** Average + 5★…1★ bars. Click a bar to filter by that rating. */
export function RatingBreakdown({
  average,
  total,
  breakdown,
  active,
  onSelect,
}: {
  average: number;
  total: number;
  breakdown: Record<string, number>;
  active?: number;
  onSelect?: (rating: number | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="text-center sm:w-36">
        <p className="font-display text-5xl font-bold">{total ? average.toFixed(1) : "—"}</p>
        <Stars value={average} className="mt-2" />
        <p className="mt-1 text-sm text-muted-foreground">
          {total} review{total === 1 ? "" : "s"}
        </p>
      </div>
      <ul className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = breakdown[n] ?? 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          const selected = active === n;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={!onSelect || !count}
                onClick={() => onSelect?.(selected ? undefined : n)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-1 text-sm transition-colors enabled:hover:bg-muted",
                  selected && "bg-primary/10",
                )}
              >
                <span className="w-8 shrink-0 text-left font-medium">{n} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-warning transition-all" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
