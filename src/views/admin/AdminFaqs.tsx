"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { FieldRow, SelectField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusSwitch } from "@/components/common/StatusSwitch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { PERMISSIONS as P } from "@/lib/permissions";
import { STATUS_OPTIONS } from "@/features/catalog/api";
import { FAQ_CATEGORY_OPTIONS, faqHooks, type FaqInput } from "@/features/content/api";
import { humanize } from "@/components/common/StatusBadge";
import type { Faq } from "@/types/models";

const schema = z.object({
  question: z.string().trim().min(5, "At least 5 characters").max(255),
  answer: z.string().trim().min(5, "At least 5 characters").max(5000),
  category: z.string(),
  sortOrder: z.number({ invalid_type_error: "Enter a number" }).int().min(0).max(100_000),
  status: z.enum(["active", "inactive"]),
});
type Form = z.output<typeof schema>;

const NONE = "none";
const CATEGORY_OPTIONS = [{ value: NONE, label: "No group" }, ...FAQ_CATEGORY_OPTIONS];

export default function AdminFaqs() {
  const { can } = useAuth();
  const canUpdate = can(P.FAQ.UPDATE);
  const list = useListParams({ defaults: { sortBy: "sortOrder", sortOrder: "asc" } });
  const query = faqHooks.useList(list.params);
  const update = faqHooks.useUpdate({ successMessage: false });

  const editor = useCrudEditor<Faq, Form, FaqInput>({
    hooks: faqHooks,
    entity: "FAQ",
    toForm: (f) => ({ question: f?.question ?? "", answer: f?.answer ?? "", category: f?.category ?? NONE, sortOrder: f?.sortOrder ?? 0, status: f?.status ?? "active" }),
    toInput: (v) => ({ ...v, category: v.category === NONE ? null : v.category }),
  });
  const remove = useCrudDelete(faqHooks, "FAQ", (f: Faq) => f.question);

  const columns = useMemo<ColumnDef<Faq>[]>(
    () => [
      {
        id: "question",
        header: "Question",
        cell: ({ row }) => (
          <div className="min-w-[260px] max-w-xl">
            <p className="font-medium">{row.original.question}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{row.original.answer}</p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Group",
        cell: ({ row }) => (row.original.category ? <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{humanize(row.original.category)}</span> : "—"),
      },
      { id: "sortOrder", header: "Order", enableSorting: true, meta: { className: "w-20 text-center" }, cell: ({ row }) => row.original.sortOrder },
      {
        id: "status",
        header: "Visible",
        cell: ({ row }) => (
          <StatusSwitch
            active={row.original.status === "active"}
            label={`Toggle ${row.original.question}`}
            disabled={!canUpdate}
            pending={update.isPending && update.variables?.id === row.original.id}
            onToggle={(on) => update.mutate({ id: row.original.id, data: { status: on ? "active" : "inactive" } })}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => editor.open(row.original), visible: canUpdate },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.FAQ.DELETE) },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, canUpdate, remove, update.isPending, update.variables],
  );

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Answers shown on the home and services pages. Lower order numbers come first."
        actions={
          <Can permission={P.FAQ.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> New FAQ
            </Button>
          </Can>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={canUpdate ? editor.open : undefined}
        emptyTitle="No FAQs yet"
        emptyDescription="Add the questions customers ask most — it saves your team time."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search questions…"
            filters={
              <>
                <TableFilter list={list} param="category" options={FAQ_CATEGORY_OPTIONS} allLabel="All groups" placeholder="Group" />
                <TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
              </>
            }
          />
        }
      />
      <FormModal schema={schema} size="lg" {...editor.modalProps}>
        <TextField name="question" label="Question" placeholder="e.g. Do you groom cats?" required autoFocus />
        <TextareaField name="answer" label="Answer" rows={5} required />
        <FieldRow cols={3}>
          <SelectField name="category" label="Group" options={CATEGORY_OPTIONS} />
          <TextField name="sortOrder" label="Order" type="number" min={0} />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </FieldRow>
      </FormModal>
    </>
  );
}
