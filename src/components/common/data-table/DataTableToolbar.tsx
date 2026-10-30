"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UseListParams } from "@/hooks/use-list-params";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { Option } from "@/components/common/form/fields";
import { cn } from "@/lib/utils";

/** Debounced search bound to `searchTerm`. Local state keeps typing instant; the API sees it 400ms later. */
export function TableSearch({ list, placeholder = "Search…", className }: { list: UseListParams; placeholder?: string; className?: string }) {
  const current = (list.params.searchTerm as string | undefined) ?? "";
  const [text, setText] = useState(current);
  const debounced = useDebouncedValue(text.trim());

  // URL → input (back/forward, reset)
  useEffect(() => setText(current), [current]);

  // input → URL
  useEffect(() => {
    if (debounced !== current) list.setParams({ searchTerm: debounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced text
  }, [debounced]);

  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="h-9 pl-9 pr-8" aria-label="Search table" />
      {text && (
        <button type="button" onClick={() => setText("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Dropdown filter bound to one query param. "All" clears it. */
export function TableFilter({
  list,
  param,
  options,
  placeholder,
  allLabel = "All",
  className,
}: {
  list: UseListParams;
  param: string;
  options: Option<string | number>[];
  placeholder?: string;
  /** `false` = no "All" entry (the filter always has a value, usually from `defaults`). */
  allLabel?: string | false;
  className?: string;
}) {
  const value = list.params[param];
  return (
    <Select value={value === undefined || value === null ? "all" : String(value)} onValueChange={(v) => list.setParams({ [param]: v === "all" ? undefined : v })}>
      <SelectTrigger className={cn("h-9 w-full sm:w-44", className)} aria-label={placeholder ?? param}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel !== false && <SelectItem value="all">{allLabel}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={String(o.value)} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** From–to date filter bound to two params (default `from` / `to`, "YYYY-MM-DD"). */
export function TableDateRange({ list, fromParam = "from", toParam = "to", label = "Date" }: { list: UseListParams; fromParam?: string; toParam?: string; label?: string }) {
  const from = (list.params[fromParam] as string | undefined) ?? "";
  const to = (list.params[toParam] as string | undefined) ?? "";
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={`${label} range`}>
      <Input type="date" value={from} max={to || undefined} onChange={(e) => list.setParams({ [fromParam]: e.target.value || undefined })} className="h-9 w-full sm:w-[150px]" aria-label={`${label} from`} />
      <span className="text-xs text-muted-foreground">to</span>
      <Input type="date" value={to} min={from || undefined} onChange={(e) => list.setParams({ [toParam]: e.target.value || undefined })} className="h-9 w-full sm:w-[150px]" aria-label={`${label} to`} />
    </div>
  );
}

const CONTROL_KEYS = new Set(["page", "limit", "sortBy", "sortOrder"]);

/** Layout: search + filters on the left, actions on the right, "Clear" when anything is filtered. */
export function DataTableToolbar({
  list,
  searchPlaceholder,
  filters,
  actions,
  defaults = {},
}: {
  list: UseListParams;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  /** Params that are part of the page (e.g. a fixed role filter) and shouldn't count as "filtered". */
  defaults?: Record<string, unknown>;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const active = Object.entries(list.params).filter(([k, v]) => !CONTROL_KEYS.has(k) && k !== "searchTerm" && v !== undefined && v !== "" && defaults[k] !== v).length;
  const filtered = active > 0 || !!list.params.searchTerm;
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex gap-2">
          <TableSearch list={list} placeholder={searchPlaceholder} />
          {/* phones: filters collapse behind one button */}
          {filters && (
            <Button variant="outline" size="sm" className="h-9 shrink-0 sm:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />
              Filters{active ? ` (${active})` : ""}
            </Button>
          )}
        </div>
        {filters && <div className={cn("flex-col gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center", showFilters ? "flex" : "hidden")}>{filters}</div>}
        {filtered && (
          <Button variant="ghost" size="sm" onClick={list.reset} className="h-9 text-muted-foreground">
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
