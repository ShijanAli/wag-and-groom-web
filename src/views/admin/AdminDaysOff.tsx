"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { differenceInCalendarDays, parse } from "date-fns";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { DateField, SegmentedField } from "@/components/common/form/choice-fields";
import { SelectField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { formatDay, toApiDate } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { blockedDateHooks, useStaffOptions, type BlockedDateInput } from "@/features/staff/api";
import type { BlockedDate } from "@/types/models";

const schema = z
  .object({
    scope: z.enum(["business", "staff"]),
    staffId: z.number().optional(),
    date: z.string().min(1, "Pick a date"),
    reason: z.string().trim().max(255),
  })
  .refine((v) => v.scope === "business" || !!v.staffId, { path: ["staffId"], message: "Choose a staff member" });
type Form = z.output<typeof schema>;

const SCOPE_OPTIONS = [
  { label: "Whole business", value: "business", hint: "Shop closed — no bookings" },
  { label: "One staff member", value: "staff", hint: "Leave / day off" },
];

function relativeDay(value: string) {
  const days = differenceInCalendarDays(parse(value.slice(0, 10), "yyyy-MM-dd", new Date()), new Date());
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `In ${days} days`;
  return `${-days} day${days === -1 ? "" : "s"} ago`;
}

export default function AdminDaysOff() {
  const { can } = useAuth();
  const today = toApiDate(new Date());
  const list = useListParams({ defaults: { sortBy: "date", sortOrder: "asc", from: today } });
  const query = blockedDateHooks.useList(list.params);
  const staff = useStaffOptions();
  const canManage = can(P.BLOCKED_DATE.MANAGE);

  const editor = useCrudEditor<BlockedDate, Form, BlockedDateInput>({
    hooks: blockedDateHooks,
    entity: "day off",
    toForm: (b) => ({ scope: b && !b.staffId ? "business" : b ? "staff" : "business", staffId: b?.staffId ?? undefined, date: b?.date.slice(0, 10) ?? "", reason: b?.reason ?? "" }),
    // the API only allows changing date + reason after creation
    toInput: (v, item) =>
      (item ? { date: v.date, reason: v.reason || null } : { staffId: v.scope === "staff" ? v.staffId! : null, date: v.date, reason: v.reason || null }) as BlockedDateInput,
  });
  const remove = useCrudDelete(blockedDateHooks, "day off", (b: BlockedDate) => formatDay(b.date));

  const columns = useMemo<ColumnDef<BlockedDate>[]>(
    () => [
      {
        id: "date",
        header: "Date",
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{formatDay(row.original.date)}</p>
            <p className="text-xs text-muted-foreground">{relativeDay(row.original.date)}</p>
          </div>
        ),
      },
      {
        id: "scope",
        header: "Applies to",
        cell: ({ row }) =>
          row.original.staff ? (
            <UserCell user={row.original.staff} />
          ) : (
            <span className="inline-flex items-center gap-2 font-medium text-destructive">
              <Building2 className="h-4 w-4" /> Whole business closed
            </span>
          ),
      },
      { id: "reason", header: "Reason", cell: ({ row }) => row.original.reason ?? <span className="text-muted-foreground">—</span> },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => editor.open(row.original), visible: canManage },
              { label: "Remove", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: canManage },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, remove],
  );

  return (
    <>
      <PageHeader
        title="Holidays & days off"
        description="Closed days and staff leave. Booking slots skip these dates automatically."
        actions={
          <Can permission={P.BLOCKED_DATE.MANAGE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> Add day off
            </Button>
          </Can>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No upcoming days off"
        emptyDescription="Add public holidays or staff leave so customers can't book those days."
        toolbar={
          <DataTableToolbar
            list={list}
            defaults={{ from: today }}
            searchPlaceholder="Search reason…"
            filters={
              <>
                <TableFilter
                  list={list}
                  param="from"
                  allLabel={false}
                  options={[
                    { label: "Upcoming", value: today },
                    { label: "Include past", value: "2000-01-01" },
                  ]}
                  placeholder="Period"
                />
                <TableFilter
                  list={list}
                  param="scope"
                  options={[
                    { label: "Whole business", value: "business" },
                    { label: "Staff leave", value: "staff" },
                  ]}
                  allLabel="Business & staff"
                  placeholder="Type"
                />
                <TableFilter list={list} param="staffId" options={staff.data ?? []} allLabel="All staff" placeholder="Staff" />
              </>
            }
          />
        }
      />
      <FormModal schema={schema} {...editor.modalProps}>
        <ScopeFields editing={!!editor.item} staffOptions={staff.data ?? []} />
        <DateField name="date" label="Date" fromDate={new Date()} required />
        <TextField name="reason" label="Reason" placeholder="e.g. Victory Day, annual leave" maxLength={255} />
      </FormModal>
    </>
  );
}

/** Scope + staff picker; locked when editing (the API can't move a day off between staff). */
function ScopeFields({ editing, staffOptions }: { editing: boolean; staffOptions: { value: number; label: React.ReactNode }[] }) {
  const scope = useWatch({ name: "scope" });
  return (
    <>
      <SegmentedField name="scope" label="Applies to" options={SCOPE_OPTIONS} disabled={editing} />
      {scope === "staff" && <SelectField name="staffId" label="Staff member" options={staffOptions} numeric required disabled={editing} placeholder="Choose staff" />}
    </>
  );
}
