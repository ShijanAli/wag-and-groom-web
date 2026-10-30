"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { SelectField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { STATUS_OPTIONS, petTypeHooks, type PetTypeInput } from "@/features/catalog/api";
import type { PetType } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(50),
  icon: z.string().trim().max(50),
  status: z.enum(["active", "inactive"]),
});
type Form = z.output<typeof schema>;

export default function AdminPetTypes() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "name", sortOrder: "asc" } });
  const query = petTypeHooks.useList(list.params);
  const editor = useCrudEditor<PetType, Form, PetTypeInput>({
    hooks: petTypeHooks,
    entity: "pet type",
    toForm: (t) => ({ name: t?.name ?? "", icon: t?.icon ?? "", status: t?.status ?? "active" }),
    toInput: (v) => ({ ...v, icon: v.icon || null }),
  });
  const remove = useCrudDelete(petTypeHooks, "pet type", (t: PetType) => t.name);

  const columns = useMemo<ColumnDef<PetType>[]>(
    () => [
      { id: "name", header: "Pet type", enableSorting: true, cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
      { id: "slug", header: "Slug", cell: ({ row }) => <code className="text-xs text-muted-foreground">{row.original.slug}</code> },
      { id: "icon", header: "Icon", cell: ({ row }) => row.original.icon ?? <span className="text-muted-foreground">—</span> },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "createdAt", header: "Added", enableSorting: true, cell: ({ row }) => formatDate(row.original.createdAt) },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => editor.open(row.original), visible: can(P.PET_TYPE.UPDATE) },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.PET_TYPE.DELETE) },
            ]}
          />
        ),
      },
    ],
    // editor.open is stable (useCallback inside useDisclosure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, remove],
  );

  return (
    <>
      <PageHeader
        title="Pet types"
        description="Animals you work with. Services, customer pets and adoption listings use these."
        actions={
          <Can permission={P.PET_TYPE.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> New pet type
            </Button>
          </Can>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No pet types yet"
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search pet types…"
            filters={<TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />}
          />
        }
      />
      <FormModal schema={schema} size="sm" {...editor.modalProps}>
        <TextField name="name" label="Name" placeholder="e.g. Dog" required autoFocus />
        <TextField name="icon" label="Icon" placeholder="e.g. dog" description="Optional icon key used by the website." />
        <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
      </FormModal>
    </>
  );
}
