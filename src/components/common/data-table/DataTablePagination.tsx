"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaginationMeta } from "@/lib/api/types";
import type { ListParamsPatch } from "@/hooks/use-list-params";

const PAGE_SIZES = [10, 20, 50, 100];

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  return [1, ...(start > 2 ? ["…" as const] : []), ...Array.from({ length: end - start + 1 }, (_, i) => start + i), ...(end < total - 1 ? ["…" as const] : []), total];
}

export const DataTablePagination = memo(function DataTablePagination({
  meta,
  onChange,
}: {
  meta: PaginationMeta;
  onChange: (patch: ListParamsPatch) => void;
}) {
  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const go = (p: number) => onChange({ page: Math.min(Math.max(1, p), totalPages) });

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:flex-row">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{from}</span>–<span className="font-medium text-foreground">{to}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span>
        </span>
        <Select value={String(limit)} onValueChange={(v) => onChange({ limit: Number(v) })}>
          <SelectTrigger className="h-8 w-[72px]" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => go(1)} aria-label="First page">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            {pageWindow(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1.5 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  className="h-8 min-w-8 px-2"
                  onClick={() => go(p)}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              ),
            )}
          </div>
          <span className="px-2 text-muted-foreground sm:hidden">
            {page} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => go(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => go(totalPages)} aria-label="Last page">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
});
