"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarOff, CircleCheck, CirclePause, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { ChipList } from "@/components/common/Chip";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { FieldRow, PasswordField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { useApiMutation } from "@/lib/api/hooks";
import type { Id } from "@/lib/api/types";
import { fullName } from "@/lib/auth";
import { PERMISSIONS as P } from "@/lib/permissions";
import { emailSchema, passwordSchema, phoneSchema } from "@/features/auth/schemas";
import { useServiceOptions } from "@/features/catalog/api";
import { ScheduleModal } from "@/features/staff/ScheduleModal";
import { staffInvalidate, summarizeSchedule, useStaffList, useStaffRoleId } from "@/features/staff/api";
import { usersApi } from "@/features/users/api";
import type { StaffMember, UserStatus } from "@/types/models";

const profileFields = {
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.union([phoneSchema, z.literal("")]),
};
const createSchema = z.object({ ...profileFields, email: emailSchema, password: z.union([passwordSchema, z.literal("")]) });
const editSchema = z.object(profileFields);

export default function AdminStaff() {
  const { can } = useAuth();
  const { confirm, confirmDelete } = useConfirm();
  const list = useListParams({ defaults: { sortBy: "firstName", sortOrder: "asc" } });
  const query = useStaffList(list.params);
  const services = useServiceOptions();
  const staffRoleId = useStaffRoleId();

  const add = useDisclosure();
  const edit = useDisclosure<StaffMember>();
  const hours = useDisclosure<StaffMember>();

  const opts = { invalidate: staffInvalidate };
  const create = useApiMutation(usersApi.create, { ...opts, successMessage: "Staff member added" });
  const update = useApiMutation(({ id, data }: { id: Id; data: Parameters<typeof usersApi.update>[1] }) => usersApi.update(id, data), opts);
  const setStatus = useApiMutation(({ id, status }: { id: Id; status: UserStatus }) => usersApi.updateStatus(id, status), opts);
  const remove = useApiMutation(usersApi.remove, opts);
  const canManage = can(P.USER.UPDATE);

  const columns = useMemo<ColumnDef<StaffMember>[]>(
    () => [
      { id: "firstName", header: "Staff member", enableSorting: true, cell: ({ row }) => <UserCell user={row.original} secondary={row.original.email} /> },
      { id: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? <span className="text-muted-foreground">—</span> },
      {
        id: "services",
        header: "Services",
        cell: ({ row }) => <ChipList items={row.original.services} max={2} empty="None assigned" />,
      },
      {
        id: "hours",
        header: "Working hours",
        cell: ({ row }) => {
          const lines = summarizeSchedule(row.original.schedules);
          return lines.length ? (
            <div className="space-y-0.5 text-xs">
              {lines.map((l) => (
                <p key={l} className="whitespace-nowrap">
                  {l}
                </p>
              ))}
            </div>
          ) : (
            <span className="text-xs font-medium text-warning">Not set — can't be booked</span>
          );
        },
      },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const m = row.original;
          const next = m.status === "active" ? "inactive" : "active";
          return (
            <RowActions
              actions={[
                { label: "Working hours", icon: Clock, onClick: () => hours.open(m), visible: can(P.STAFF_SCHEDULE.MANAGE) },
                { label: "Edit details", icon: Pencil, onClick: () => edit.open(m), visible: canManage },
                {
                  label: next === "active" ? "Activate" : "Deactivate",
                  icon: next === "active" ? CircleCheck : CirclePause,
                  visible: canManage,
                  onClick: () =>
                    confirm({
                      title: `${next === "active" ? "Activate" : "Deactivate"} ${fullName(m)}?`,
                      description: next === "active" ? "They can sign in and be booked again." : "They can't sign in or be booked until reactivated.",
                      confirmText: next === "active" ? "Activate" : "Deactivate",
                      onConfirm: () => setStatus.mutateAsync({ id: m.id, status: next }),
                    }),
                },
                {
                  label: "Delete",
                  icon: Trash2,
                  danger: true,
                  visible: can(P.USER.DELETE),
                  onClick: () => confirmDelete({ entity: "staff member", name: fullName(m), onConfirm: () => remove.mutateAsync(m.id) }),
                },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, canManage, confirm, confirmDelete],
  );

  return (
    <>
      <PageHeader
        title="Staff"
        description="Groomers, walkers and sitters. Assign them to services from the Services page."
        actions={
          <>
            <Can permission={P.BLOCKED_DATE.VIEW}>
              <Button variant="outline" asChild>
                <Link href="/admin/days-off">
                  <CalendarOff className="mr-2 h-4 w-4" /> Holidays & days off
                </Link>
              </Button>
            </Can>
            <Can permission={P.USER.CREATE}>
              <Button onClick={() => add.open()} disabled={!staffRoleId.data}>
                <Plus className="mr-2 h-4 w-4" /> Add staff
              </Button>
            </Can>
          </>
        }
      />

      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No staff yet"
        emptyDescription="Add your team so customers can book them."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search name, email or phone…"
            filters={<TableFilter list={list} param="serviceId" options={services.data ?? []} allLabel="All services" placeholder="Service" />}
          />
        }
      />

      <FormModal
        open={add.isOpen}
        onOpenChange={add.setOpen}
        title="Add staff member"
        description="They'll sign in with this email. Leave the password empty to let them set one via “Forgot password”."
        schema={createSchema}
        defaultValues={{ firstName: "", lastName: "", email: "", phone: "", password: "" }}
        submitText="Add staff"
        onSubmit={(v) =>
          create.mutateAsync({ ...v, phone: v.phone || undefined, password: v.password || undefined, roleId: staffRoleId.data!, status: "active" })
        }
      >
        <FieldRow>
          <TextField name="firstName" label="First name" required autoFocus />
          <TextField name="lastName" label="Last name" required />
        </FieldRow>
        <TextField name="email" label="Email" type="email" required />
        <TextField name="phone" label="Phone" type="tel" placeholder="+8801XXXXXXXXX" />
        <PasswordField name="password" label="Password" autoComplete="new-password" description="Optional. 8+ characters with upper & lower case and a number." />
      </FormModal>

      <FormModal
        open={edit.isOpen}
        onOpenChange={edit.setOpen}
        title="Edit staff member"
        description={edit.item?.email}
        schema={editSchema}
        defaultValues={{ firstName: edit.item?.firstName ?? "", lastName: edit.item?.lastName ?? "", phone: edit.item?.phone ?? "" }}
        submitText="Save changes"
        onSubmit={(v) => update.mutateAsync({ id: edit.item!.id, data: { ...v, phone: v.phone || null } })}
      >
        <FieldRow>
          <TextField name="firstName" label="First name" required />
          <TextField name="lastName" label="Last name" required />
        </FieldRow>
        <TextField name="phone" label="Phone" type="tel" />
      </FormModal>

      <ScheduleModal staff={hours.item} open={hours.isOpen} onOpenChange={hours.setOpen} />
    </>
  );
}
