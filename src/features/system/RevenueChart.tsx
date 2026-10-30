"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { BarChart3, Table2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { RevenueReport } from "@/types/models";

/** Validated categorical pair (see index.css --viz-*): bookings = slot 1, adoptions = slot 2 — fixed, never re-ordered. */
const SERIES = [
  { key: "bookings", label: "Bookings", color: "var(--viz-1)" },
  { key: "adoptions", label: "Adoption fees", color: "var(--viz-2)" },
] as const;

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const periodLabel = (p: string, groupBy: RevenueReport["groupBy"], long = false) =>
  groupBy === "month" ? format(parseISO(`${p}-01`.slice(0, 10)), long ? "MMMM yyyy" : "MMM yy") : format(parseISO(p), long ? "EEE, d MMM yyyy" : "d MMM");

function ChartTooltip({ active, payload, label, groupBy }: TooltipProps<number, string> & { groupBy: RevenueReport["groupBy"] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as RevenueReport["series"][number];
  return (
    <div className="min-w-[180px] rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium">{periodLabel(String(label), groupBy, true)}</p>
      {SERIES.map((s) => (
        <p key={s.key} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
            {s.label}
          </span>
          <span className="font-medium tabular-nums">{formatMoney(row[s.key])}</span>
        </p>
      ))}
      <p className="mt-1 flex justify-between gap-4 border-t pt-1 font-semibold">
        <span>Net revenue</span>
        <span className="tabular-nums">{formatMoney(row.total)}</span>
      </p>
      <p className="text-muted-foreground">{row.payments} payment{row.payments === 1 ? "" : "s"}</p>
    </div>
  );
}

/** Net revenue per day/month, stacked by source. Legend + tooltip + a table view (the orange fill is < 3:1 on white). */
export function RevenueChart({ report }: { report: RevenueReport }) {
  const [table, setTable] = useState(false);
  const empty = report.total === 0;
  // ~8 x-axis labels whatever the range
  const interval = Math.max(0, Math.ceil(report.series.length / 8) - 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex items-center gap-4 text-xs text-muted-foreground" aria-label="Legend">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden /> {s.label}
            </li>
          ))}
        </ul>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTable((t) => !t)} aria-pressed={table}>
          {table ? <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> : <Table2 className="mr-1.5 h-3.5 w-3.5" />}
          {table ? "Chart" : "Table"}
        </Button>
      </div>

      {table ? (
        <div className="max-h-72 overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Period</th>
                {SERIES.map((s) => (
                  <th key={s.key} className="px-3 py-2 text-right font-medium">
                    {s.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {report.series
                .filter((r) => r.total !== 0 || r.payments > 0)
                .map((r) => (
                  <tr key={r.period} className="border-t">
                    <td className="px-3 py-1.5">{periodLabel(r.period, report.groupBy, true)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(r.bookings)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(r.adoptions)}</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums">{formatMoney(r.total)}</td>
                  </tr>
                ))}
              {empty && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    No revenue in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative h-72" role="img" aria-label={`Net revenue ${formatMoney(report.total)} from ${report.from} to ${report.to}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.series} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="0" />
              <XAxis
                dataKey="period"
                tickFormatter={(p) => periodLabel(p, report.groupBy)}
                interval={interval}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickFormatter={(v) => `৳${compact.format(v)}`}
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.6 }} content={<ChartTooltip groupBy={report.groupBy} />} />
              {SERIES.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  stackId="revenue"
                  fill={s.color}
                  // 2px surface gap between stacked segments; only the top segment gets rounded corners
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                  radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                  maxBarSize={36}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          {empty && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No payments in this period yet</p>}
        </div>
      )}
    </div>
  );
}
