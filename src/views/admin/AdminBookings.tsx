"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCog } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, TableDateRange, TableFilter } from "@/components/common/data-table";
import { SelectField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { fullName } from "@/lib/auth";
import { formatDateTime, formatMoney, formatTime } from "@/lib/format";

import { PERMISSIONS as P } from "@/lib/permissions";
import { BOOKING_STATUS_OPTIONS, useAdminBookings, useAssignStaff, useBookingDetail } from "@/features/bookings/api";
import { BookingBadges, BookingDetail, bookingDay } from "@/features/bookings/components";
import { StatusActions } from "@/features/bookings/StatusActions";
import { useServiceOptions } from "@/features/catalog/api";

import { useStaffList, useStaffOptions } from "@/features/staff/api";
import type { Booking } from "@/types/models";

const assignSchema = z.object({ staffId: z.number({ required_error: "Choose a staff member" }).int().positive("Choose a staff member") });


export default function AdminBookings() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "bookingDate", sortOrder: "desc" } });
  const query = useAdminBookings(list.params);
  const services = useServiceOptions();
  const staff = useStaffOptions();
  const detail = useDisclosure<Booking>();
  const canStatus = can(P.BOOKING.UPDATE_STATUS);

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        id: "bookingDate",
        header: "When",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <p className="font-medium">{bookingDay(row.original, "EEE, d MMM")}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(row.original.startTime)}–{formatTime(row.original.endTime)}
            </p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (row.original.user ? <UserCell user={row.original.user} secondary={row.original.user.phone ?? row.original.user.email} /> : "—"),
      },
      {
        id: "service",
        header: "Service",
        cell: ({ row }) => (
          <div className="min-w-[150px]">
            <p className="font-medium">{row.original.service.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.pet.name} · {row.original.pet.petType.name}
            </p>
          </div>
        ),
      },
      {
        id: "staff",
        header: "Staff",
        cell: ({ row }) => (row.original.assignedStaff ? fullName(row.original.assignedStaff) : <span className="text-xs font-medium text-warning">Unassigned</span>),
      },
      {
        id: "totalAmount",
        header: "Total",
        enableSorting: true,
        cell: ({ row }) => <span className="whitespace-nowrap font-semibold">{formatMoney(row.original.totalAmount)}</span>,
      },
      { id: "status", header: "Status", enableSorting: true, cell: ({ row }) => <BookingBadges booking={row.original} /> },
      {
        id: "actions",
        header: "",
        meta: { className: "text-right" },
        cell: ({ row }) => (canStatus ? <StatusActions booking={row.original} className="justify-end" /> : null),
      },
    ],
    [canStatus],
  );

  return (
    <>
      <PageHeader title="Bookings" description="Every appointment — confirm, start, complete and assign staff." />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={detail.open}
        emptyTitle="No bookings found"
        emptyDescription="Bookings made on the website appear here instantly."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Booking no., customer or pet…"
            filters={
              <>
                <TableFilter list={list} param="status" options={BOOKING_STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />

                <TableFilter list={list} param="serviceId" options={services.data ?? []} allLabel="All services" placeholder="Service" />
                <TableFilter list={list} param="staffId" options={staff.data ?? []} allLabel="All staff" placeholder="Staff" />
                <TableDateRange list={list} />
              </>
            }
          />
        }
      />
      <BookingPanel booking={detail.item} open={detail.isOpen} onOpenChange={detail.setOpen} />
    </>
  );
}

/** Detail modal with the admin actions (status, staff). Loads the status history. */
function BookingPanel({ booking, open, onOpenChange }: { booking: Booking | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { can } = useAuth();
  const q = useBookingDetail(open ? booking?.id : null);
  const assign = useDisclosure();
  const assignStaff = useAssignStaff();
  // only staff who provide this service can be assigned
  const providers = useStaffList({ serviceId: booking?.serviceId, limit: 100 });
  const b = q.data;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Booking"
      description={booking ? `${booking.service.name} · ${booking.pet.name}` : undefined}
      footer={
        b && (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Can permission={P.BOOKING.ASSIGN_STAFF}>
                {!["completed", "cancelled", "no_show"].includes(b.status) && (
                  <Button variant="outline" size="sm" onClick={() => assign.open()}>
                    <UserCog className="mr-1.5 h-4 w-4" /> {b.assignedStaff ? "Change staff" : "Assign staff"}
                  </Button>
                )}
              </Can>

            </div>
            {can(P.BOOKING.UPDATE_STATUS) && <StatusActions booking={b} />}
          </div>
        )
      }
    >
      {b ? <BookingDetail booking={b} showCustomer /> : <Skeleton className="h-96 w-full" />}
      {b && <p className="mt-4 text-xs text-muted-foreground">Created {formatDateTime(b.createdAt)}</p>}

      <FormModal
        open={assign.isOpen}
        onOpenChange={assign.setOpen}
        size="sm"
        title="Assign staff"
        description="Only staff who provide this service are listed. The API checks they are free at this time."
        schema={assignSchema}
        defaultValues={{ staffId: b?.assignedStaffId ?? (undefined as unknown as number) }}
        submitText="Assign"
        onSubmit={(v) => assignStaff.mutateAsync({ id: b!.id, staffId: v.staffId })}
      >
        <SelectField
          name="staffId"
          label="Staff member"
          numeric
          placeholder="Choose staff"
          options={(providers.data?.data ?? []).map((s) => ({ value: s.id, label: fullName(s), disabled: s.status !== "active" }))}
        />
      </FormModal>

    </Modal>
  );
}
