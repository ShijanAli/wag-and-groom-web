"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import type { UseQueryResult } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import type { UseListParams } from "@/hooks/use-list-params";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./DataTablePagination";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** td + th classes, e.g. "w-12 text-right" */
    className?: string;
    /** Backend `sortBy` value when it differs from the column id. */
    sortKey?: string;
  }
}

export interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  /** A `useList()` result — loading, refetching, error and data are all read from it. */
  query: UseQueryResult<Paginated<T>>;
  /** `useListParams()` result. Omit for small, unpaginated lists. */
  list?: UseListParams;
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * Server-driven table: pagination, sorting and filtering happen in the API,
 * the table only renders. Columns opt into sorting with `enableSorting: true`.
 */
export function DataTable<T>({
  columns,
  query,
  list,
  toolbar,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  getRowId,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    // sorting is server-side: a column is sortable when its def says `enableSorting: true` (works for display columns too)
    enableSorting: false,
    getRowId: getRowId ? (row) => getRowId(row) : (row, i) => String((row as { id?: unknown }).id ?? i),
  });

  const sortBy = list?.params.sortBy;
  const sortOrder = list?.params.sortOrder;

  const toggleSort = (key: string) => {
    if (!list) return;
    const order = sortBy === key && sortOrder === "desc" ? "asc" : "desc";
    list.setParams({ sortBy: key, sortOrder: order });
  };

  const colCount = table.getVisibleLeafColumns().length;
  const initialLoading = query.isPending;
  const refetching = query.isFetching && !initialLoading;

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      {toolbar && <div className="border-b p-3 sm:p-4">{toolbar}</div>}

      <div className={cn("relative overflow-x-auto transition-opacity", refetching && "opacity-60")}>
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const col = header.column;
                  const key = col.columnDef.meta?.sortKey ?? col.id;
                  const active = sortBy === key;
                  const label = header.isPlaceholder ? null : flexRender(col.columnDef.header, header.getContext());
                  return (
                    <TableHead key={header.id} className={cn("h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-wide", col.columnDef.meta?.className)}>
                      {col.columnDef.enableSorting && list ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(key)}
                          className={cn("-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase tracking-wide hover:text-foreground", active && "text-foreground")}
                        >
                          {label}
                          {active ? (
                            sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {initialLoading ? (
              Array.from({ length: Math.min(list?.params.limit ?? 5, 8) }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: colCount }, (_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : query.isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="py-14 text-center">
                  <p className="text-sm font-medium text-destructive">{getErrorMessage(query.error, "Couldn't load data")}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => query.refetch()}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" /> Try again
                  </Button>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="py-14">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Inbox className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <p className="font-medium">{list?.params.searchTerm ? "No results match your search" : emptyTitle}</p>
                    {emptyDescription && <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>}
                    {emptyAction}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("py-3", cell.column.columnDef.meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {list && meta && meta.total > 0 && <DataTablePagination meta={meta} onChange={list.setParams} />}
    </div>
  );
}
