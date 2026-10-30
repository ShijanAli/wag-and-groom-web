"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, KeyRound, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { FieldRow, PasswordField, SelectField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { fullName } from "@/lib/auth";
import { formatDate, timeAgo } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { useRoleOptions } from "@/features/system/api";
import { CustomerDetailModal } from "@/features/users/CustomerDetail";
import { USER_STATUS_OPTIONS, useUpdateUserRole, userHooks } from "@/features/users/api";
import { useUserStatusActions, userCreateFields } from "@/features/users/shared";
import type { User } from "@/types/models";

const createSchema = z.object({ ...userCreateFields, roleId: z.number({ required_error: "Pick a role", invalid_type_error: "Pick a role" }).int().positive("Pick a role") });
const roleSchema = z.object({ roleId: z.number().int().positive() });

/** Every account (team + customers) with role management. Customers also have their own page. */
export default function AdminUsers() {
  const { can, user: me } = useAuth();
  const { confirmDelete } = useConfirm();
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = userHooks.useList(list.params);
  const roles = useRoleOptions();
  const create = userHooks.useCreate({ successMessage: "Account created" });
  const remove = userHooks.useRemove();
  const changeRole = useUpdateUserRole();
  const statusActions = useUserStatusActions();
  const add = useDisclosure();
  const roleEdit = useDisclosure<User>();
  const view = useDisclosure<User>();

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "firstName",
        header: "Person",
        enableSorting: true,
        cell: ({ row }) => (
          <UserCell
            user={row.original}
            secondary={
              <>
                {row.original.email}
                {row.original.id === me?.id && <span className="ml-1.5 rounded bg-muted px-1.5 py-px text-[10px] font-semibold uppercase">You</span>}
              </>
            }
          />
        ),
      },
      { id: "role", header: "Role", cell: ({ row }) => <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{row.original.role.name}</span> },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "lastLoginAt", header: "Last seen", enableSorting: true, cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.lastLoginAt ? timeAgo(row.original.lastLoginAt) : "Never"}</span> },
      { id: "createdAt", header: "Joined", enableSorting: true, cell: ({ row }) => formatDate(row.original.createdAt) },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const u = row.original;
          const self = u.id === me?.id;
          return (
            <RowActions
              actions={[
                { label: "View", icon: Eye, onClick: () => view.open(u) },
                { label: "Change role", icon: KeyRound, onClick: () => roleEdit.open(u), visible: can(P.USER.UPDATE) && !self },
                ...statusActions(u),
                {
                  label: "Delete",
                  icon: Trash2,
                  danger: true,
                  visible: can(P.USER.DELETE) && !self,
                  onClick: () => confirmDelete({ entity: "account", name: fullName(u), onConfirm: () => remove.mutateAsync(u.id) }),
                },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, me?.id, statusActions, confirmDelete],
  );

  const roleOptions = roles.data ?? [];

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone who can sign in — team members and customers. Use a role to decide what they can do."
        actions={
          <Can permission={P.USER.CREATE}>
            <Button onClick={() => add.open()}>
              <Plus className="mr-2 h-4 w-4" /> Add user
            </Button>
          </Can>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={view.open}
        emptyTitle="No users found"
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search name, email or phone…"
            filters={
              <>
                <TableFilter list={list} param="roleId" options={roleOptions} allLabel="All roles" placeholder="Role" />
                <TableFilter list={list} param="status" options={USER_STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
              </>
            }
          />
        }
      />

      <FormModal
        open={add.isOpen}
        onOpenChange={add.setOpen}
        title="Add user"
        description="They sign in with this email. Leave the password empty to let them set one via “Forgot password”."
        schema={createSchema}
        defaultValues={{ firstName: "", lastName: "", email: "", phone: "", password: "", roleId: roleOptions.find((r) => r.slug === "staff")?.value as number }}
        submitText="Create account"
        onSubmit={(v) => create.mutateAsync({ ...v, phone: v.phone || undefined, password: v.password || undefined, status: "active" })}
      >
        <FieldRow>
          <TextField name="firstName" label="First name" required autoFocus />
          <TextField name="lastName" label="Last name" required />
        </FieldRow>
        <TextField name="email" label="Email" type="email" required />
        <FieldRow>
          <TextField name="phone" label="Phone" type="tel" placeholder="+8801XXXXXXXXX" />
          <SelectField name="roleId" label="Role" options={roleOptions} numeric required placeholder="Choose…" />
        </FieldRow>
        <PasswordField name="password" label="Password" autoComplete="new-password" description="Optional. 8+ characters with upper & lower case and a number." />
      </FormModal>

      <FormModal
        open={roleEdit.isOpen}
        onOpenChange={roleEdit.setOpen}
        title="Change role"
        description={roleEdit.item ? `${fullName(roleEdit.item)} · currently ${roleEdit.item.role.name}` : undefined}
        schema={roleSchema}
        size="sm"
        defaultValues={{ roleId: roleEdit.item?.roleId }}
        submitText="Change role"
        onSubmit={(v) => changeRole.mutateAsync({ id: roleEdit.item!.id, roleId: v.roleId })}
      >
        <SelectField name="roleId" label="New role" options={roleOptions} numeric required />
        <p className="text-sm text-muted-foreground">The panel they see changes with the role. Moving someone to Customer removes their panel access.</p>
      </FormModal>

      <CustomerDetailModal customer={view.item} open={view.isOpen} onOpenChange={view.setOpen} />
    </>
  );
}
