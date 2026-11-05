"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { BarChart3, Table2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { BookingValueReport } from "@/types/models";

/** Single series: slot 1 of the validated categorical palette (see index.css --viz-*). */
const COLOR = "var(--viz-1)";

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const periodLabel = (p: string, groupBy: BookingValueReport["groupBy"], long = false) =>
  groupBy === "month" ? format(parseISO(`${p}-01`.slice(0, 10)), long ? "MMMM yyyy" : "MMM yy") : format(parseISO(p), long ? "EEE, d MMM yyyy" : "d MMM");

function ChartTooltip({ active, payload, label, groupBy }: TooltipProps<number, string> & { groupBy: BookingValueReport["groupBy"] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as BookingValueReport["series"][number];
  return (
    <div className="min-w-[180px] rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium">{periodLabel(String(label), groupBy, true)}</p>
      <p className="flex justify-between gap-4 font-semibold">
        <span>Booking value</span>
        <span className="tabular-nums">{formatMoney(row.value)}</span>
      </p>
      <p className="text-muted-foreground">
        {row.completed} completed booking{row.completed === 1 ? "" : "s"}
      </p>
    </div>
  );
}

/** Value of completed bookings per day/month. Tooltip + a table view for accessibility. */
export function BookingValueChart({ report }: { report: BookingValueReport }) {
  const [table, setTable] = useState(false);
  const empty = report.completed === 0;
  // ~8 x-axis labels whatever the range
  const interval = Math.max(0, Math.ceil(report.series.length / 8) - 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR }} aria-hidden /> Completed bookings · {report.completed}
        </p>
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
                <th className="px-3 py-2 text-right font-medium">Completed</th>
                <th className="px-3 py-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {report.series
                .filter((r) => r.completed > 0)
                .map((r) => (
                  <tr key={r.period} className="border-t">
                    <td className="px-3 py-1.5">{periodLabel(r.period, report.groupBy, true)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{r.completed}</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums">{formatMoney(r.value)}</td>
                  </tr>
                ))}
              {empty && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                    No completed bookings in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative h-72" role="img" aria-label={`Completed bookings worth ${formatMoney(report.total)} from ${report.from} to ${report.to}`}>
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
              <Bar dataKey="value" fill={COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          {empty && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No completed bookings in this period yet</p>}
        </div>
      )}
    </div>
  );
}
