"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CornerDownRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { FieldRow, SelectField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { PERMISSIONS as P } from "@/lib/permissions";
import { STATUS_OPTIONS, categoryHooks, useCategoryOptions, type CategoryInput } from "@/features/catalog/api";
import type { ServiceCategory } from "@/types/models";

const NO_PARENT = 0;

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  parentId: z.number().int(),
  description: z.string().trim().max(2000),
  image: z.string().url().nullable(),
  sortOrder: z.number({ invalid_type_error: "Enter a number" }).int().min(0).max(100_000),
  status: z.enum(["active", "inactive"]),
});
type Form = z.output<typeof schema>;

const LEVEL_OPTIONS = [
  { label: "Top-level only", value: "true" },
];

export default function AdminCategories() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "sortOrder", sortOrder: "asc" } });
  const query = categoryHooks.useList(list.params);
  const roots = useCategoryOptions({ rootOnly: true });

  const editor = useCrudEditor<ServiceCategory, Form, CategoryInput>({
    hooks: categoryHooks,
    entity: "category",
    toForm: (c) => ({
      name: c?.name ?? "",
      parentId: c?.parentId ?? NO_PARENT,
      description: c?.description ?? "",
      image: c?.image ?? null,
      sortOrder: c?.sortOrder ?? 0,
      status: c?.status ?? "active",
    }),
    toInput: (v) => ({ ...v, parentId: v.parentId === NO_PARENT ? null : v.parentId, description: v.description || null }),
  });
  const remove = useCrudDelete(categoryHooks, "category", (c: ServiceCategory) => c.name);

  // A category can't be its own parent, and only top-level categories can be parents (2 levels max)
  const parentOptions = useMemo(
    () => [{ value: NO_PARENT, label: "None — top-level category" }, ...(roots.data ?? []).filter((o) => o.value !== editor.item?.id)],
    [roots.data, editor.item],
  );

  const columns = useMemo<ColumnDef<ServiceCategory>[]>(
    () => [
      {
        id: "name",
        header: "Category",
        enableSorting: true,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail
                <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  {c.parentId ? <CornerDownRight className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.parent ? `in ${c.parent.name}` : c.description ?? "Top-level"}</p>
              </div>
            </div>
          );
        },
      },
      { id: "services", header: "Services", cell: ({ row }) => row.original._count?.services ?? 0 },
      { id: "children", header: "Sub-categories", cell: ({ row }) => row.original._count?.children ?? 0 },
      { id: "sortOrder", header: "Order", enableSorting: true, cell: ({ row }) => row.original.sortOrder },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => editor.open(row.original), visible: can(P.SERVICE_CATEGORY.UPDATE) },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.SERVICE_CATEGORY.DELETE) },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, remove],
  );

  return (
    <>
      <PageHeader
        title="Service categories"
        description="Group services on the website. One level of sub-categories is supported."
        actions={
          <Can permission={P.SERVICE_CATEGORY.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> New category
            </Button>
          </Can>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No categories yet"
        emptyDescription="Create a category first — every service belongs to one."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search categories…"
            filters={
              <>
                <TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
                <TableFilter list={list} param="rootOnly" options={LEVEL_OPTIONS} allLabel="All levels" placeholder="Level" />
              </>
            }
          />
        }
      />
      <FormModal schema={schema} {...editor.modalProps}>
        <TextField name="name" label="Name" placeholder="e.g. Grooming" required autoFocus />
        <SelectField name="parentId" label="Parent category" options={parentOptions} numeric />
        <TextareaField name="description" label="Description" rows={3} />
        <ImageUploadField name="image" label="Image" folder="service-categories" />
        <FieldRow>
          <TextField name="sortOrder" label="Display order" type="number" min={0} description="Lower shows first." />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </FieldRow>
      </FormModal>
    </>
  );
}
