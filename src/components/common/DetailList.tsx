import { cn } from "@/lib/utils";

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  /** Span both columns (long text such as notes / address). */
  full?: boolean;
}

/** Label / value grid for "view details" modals and side panels. */
export function DetailList({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4 sm:grid-cols-2", className)}>
      {items.map((i) => (
        <div key={i.label} className={cn("min-w-0", i.full && "sm:col-span-2")}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{i.label}</dt>
          <dd className="mt-1 break-words text-sm text-foreground">{i.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
