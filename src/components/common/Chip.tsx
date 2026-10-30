import { cn } from "@/lib/utils";

/** Small neutral tag for lists of names (pet types, services). */
export function Chip({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center whitespace-nowrap rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary", className)}>
      {children}
    </span>
  );
}

/** First `max` items as chips, the rest as "+N" with all names in the tooltip. */
export function ChipList({ items, max = 3, empty = "—" }: { items: { id: number | string; name: string }[]; max?: number; empty?: React.ReactNode }) {
  if (!items.length) return <span className="text-xs text-muted-foreground">{empty}</span>;
  return (
    <div className="flex max-w-[240px] flex-wrap gap-1" title={items.map((i) => i.name).join(", ")}>
      {items.slice(0, max).map((i) => (
        <Chip key={i.id}>{i.name}</Chip>
      ))}
      {items.length > max && <Chip className="bg-muted text-muted-foreground">+{items.length - max}</Chip>}
    </div>
  );
}
