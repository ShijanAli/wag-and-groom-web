"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, Eye, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { FieldRow, TextField, TextareaField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { fullName } from "@/lib/auth";
import { formatDate, timeAgo } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { phoneSchema } from "@/features/auth/schemas";
import { USER_STATUS_OPTIONS, userHooks } from "@/features/users/api";
import { useUserStatusActions } from "@/features/users/shared";
import { CustomerDetailModal } from "@/features/users/CustomerDetail";
import type { User } from "@/types/models";

const editSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.union([phoneSchema, z.literal("")]),
  address: z.string().trim().max(255),
});

const VERIFIED_OPTIONS = [
  { label: "Verified", value: "true" },
  { label: "Not verified", value: "false" },
];

export default function AdminCustomers() {
  const { can } = useAuth();
  const { confirmDelete } = useConfirm();
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  // role is fixed for this page → sent to the API but never shown in the URL
  const query = userHooks.useList({ ...list.params, role: "customer" });
  const view = useDisclosure<User>();
  const edit = useDisclosure<User>();
  const update = userHooks.useUpdate();
  const remove = userHooks.useRemove();
  const statusActions = useUserStatusActions();

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "firstName",
        header: "Customer",
        enableSorting: true,
        cell: ({ row }) => (
          <UserCell
            user={row.original}
            secondary={
              <span className="inline-flex items-center gap-1">
                {row.original.email}
                {row.original.emailVerifiedAt && <BadgeCheck className="h-3.5 w-3.5 text-success" aria-label="Verified" />}
              </span>
            }
          />
        ),
      },
      { id: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? <span className="text-muted-foreground">—</span> },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "createdAt", header: "Joined", enableSorting: true, cell: ({ row }) => formatDate(row.original.createdAt) },
      {
        id: "lastLoginAt",
        header: "Last seen",
        enableSorting: true,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastLoginAt ? timeAgo(row.original.lastLoginAt) : "Never"}</span>,
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const u = row.original;
          return (
            <RowActions
              actions={[
                { label: "View", icon: Eye, onClick: () => view.open(u) },
                { label: "Edit", icon: Pencil, onClick: () => edit.open(u), visible: can(P.USER.UPDATE) },
                ...statusActions(u),
                {
                  label: "Delete",
                  icon: Trash2,
                  danger: true,
                  visible: can(P.USER.DELETE),
                  onClick: () => confirmDelete({ entity: "customer", name: fullName(u), onConfirm: () => remove.mutateAsync(u.id) }),
                },
              ]}
            />
          );
        },
      },
    ],
    // mutation objects change every render; their mutateAsync is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, confirmDelete, statusActions],
  );

  const total = query.data?.meta.total;

  return (
    <>
      <PageHeader title="Customers" description={total !== undefined ? `${total} registered customer${total === 1 ? "" : "s"}` : "Registered customer accounts"} />

      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={view.open}
        emptyTitle="No customers yet"
        emptyDescription="Customers appear here as soon as they sign up on the website."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search name, email or phone…"
            filters={
              <>
                <TableFilter list={list} param="status" options={USER_STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
                <TableFilter list={list} param="isVerified" options={VERIFIED_OPTIONS} allLabel="Any verification" placeholder="Verification" />
              </>
            }
          />
        }
      />

      <CustomerDetailModal customer={view.item} open={view.isOpen} onOpenChange={view.setOpen} />

      <FormModal
        open={edit.isOpen}
        onOpenChange={edit.setOpen}
        title="Edit customer"
        description={edit.item?.email}
        schema={editSchema}
        defaultValues={{
          firstName: edit.item?.firstName ?? "",
          lastName: edit.item?.lastName ?? "",
          phone: edit.item?.phone ?? "",
          address: edit.item?.address ?? "",
        }}
        onSubmit={(v) =>
          update.mutateAsync({ id: edit.item!.id, data: { ...v, phone: v.phone || null, address: v.address || null } })
        }
        submitText="Save changes"
      >
        <FieldRow>
          <TextField name="firstName" label="First name" required />
          <TextField name="lastName" label="Last name" required />
        </FieldRow>
        <TextField name="phone" label="Phone" type="tel" placeholder="+8801XXXXXXXXX" />
        <TextareaField name="address" label="Address" rows={2} />
      </FormModal>
    </>
  );
}
