import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * KPI tile: label, big number, one line of context. Optional trend (vs. previous period)
 * and link (the tile becomes the shortcut to the list behind the number).
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  href,
  loading,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  /** percent change; null = no comparison possible */
  trend?: number | null;
  href?: string;
  loading?: boolean;
  className?: string;
}) {
  const body = (
    <CardContent className="flex items-start justify-between gap-3 p-5">
      <div className="min-w-0 space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="h-8 w-24" /> : <p className="font-display text-3xl font-bold tabular-nums tracking-tight">{value}</p>}
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {trend !== undefined && trend !== null && (
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", trend >= 0 ? "text-success" : "text-destructive")}>
              {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
              {Math.abs(trend).toFixed(trend % 1 ? 1 : 0)}%
              <span className="sr-only">{trend >= 0 ? "up" : "down"}</span>
            </span>
          )}
          {hint}
        </div>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
    </CardContent>
  );
  return (
    <Card className={cn("transition-shadow", href && "hover:border-primary/40 hover:shadow-md", className)}>
      {href ? (
        <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}
