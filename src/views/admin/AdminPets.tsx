"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, PawPrint, ShieldCheck, User as UserIcon } from "lucide-react";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { DetailList } from "@/components/common/DetailList";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate, formatDateTime } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { usePetTypeOptions } from "@/features/catalog/api";
import { GENDER_OPTIONS, SIZE_OPTIONS, adminPetHooks, petAge } from "@/features/pets/api";
import { CustomerDetailModal } from "@/features/users/CustomerDetail";
import type { AdminPet } from "@/types/models";

const label = (v: string | null) => (v ? v[0].toUpperCase() + v.slice(1) : null);

/** Customers' own pets (read-only — owners edit them from their dashboard). */
export default function AdminPets() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = adminPetHooks.useList(list.params);
  const types = usePetTypeOptions();
  const view = useDisclosure<AdminPet>();
  const owner = useDisclosure<AdminPet["user"]>();

  const columns = useMemo<ColumnDef<AdminPet>[]>(
    () => [
      {
        id: "name",
        header: "Pet",
        enableSorting: true,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <PawPrint className="h-4 w-4" />
                </span>
              )}
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{[p.petType.name, p.breed].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
          );
        },
      },
      { id: "details", header: "Details", cell: ({ row }) => <span className="text-sm">{[label(row.original.gender), label(row.original.size), petAge(row.original.dateOfBirth)].filter(Boolean).join(" · ") || "—"}</span> },
      {
        id: "isVaccinated",
        header: "Vaccinated",
        cell: ({ row }) =>
          row.original.isVaccinated ? (
            <span className="inline-flex items-center gap-1 text-sm text-success">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Yes
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">No</span>
          ),
      },
      { id: "owner", header: "Owner", cell: ({ row }) => <UserCell user={row.original.user} secondary={row.original.user.phone ?? row.original.user.email} /> },
      { id: "createdAt", header: "Added", enableSorting: true, cell: ({ row }) => formatDate(row.original.createdAt) },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "View", icon: Eye, onClick: () => view.open(row.original) },
              { label: "View owner", icon: UserIcon, onClick: () => owner.open(row.original.user), visible: can(P.USER.VIEW) },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can],
  );

  const total = query.data?.meta.total;
  const p = view.item;

  return (
    <>
      <PageHeader title="Pets" description={total !== undefined ? `${total} pet${total === 1 ? "" : "s"} registered by customers` : "Pets registered by customers"} />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={view.open}
        emptyTitle="No pets yet"
        emptyDescription="Customers add their pets from their dashboard or while booking."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search pet, breed or owner…"
            filters={
              <>
                <TableFilter list={list} param="petTypeId" options={types.data ?? []} allLabel="All animals" placeholder="Animal" />
                <TableFilter list={list} param="size" options={SIZE_OPTIONS} allLabel="Any size" placeholder="Size" />
                <TableFilter list={list} param="gender" options={GENDER_OPTIONS} allLabel="Any gender" placeholder="Gender" />
                <TableFilter list={list} param="isVaccinated" options={[{ label: "Vaccinated", value: "true" }, { label: "Not vaccinated", value: "false" }]} allLabel="Vaccination: any" placeholder="Vaccination" />
              </>
            }
          />
        }
      />

      <Modal
        open={view.isOpen}
        onOpenChange={view.setOpen}
        title={p?.name ?? "Pet"}
        description={p && [p.petType.name, p.breed].filter(Boolean).join(" · ")}
        footer={
          p &&
          can(P.USER.VIEW) && (
            <Button variant="outline" onClick={() => (view.close(), owner.open(p.user))}>
              <UserIcon className="mr-2 h-4 w-4" /> Owner&apos;s profile
            </Button>
          )
        }
      >
        {p && (
          <div className="space-y-4">
            {p.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photo} alt={p.name} className="aspect-video w-full rounded-xl object-cover" />
            )}
            <DetailList
              items={[
                { label: "Gender", value: label(p.gender) },
                { label: "Size", value: label(p.size) },
                { label: "Born", value: p.dateOfBirth ? `${formatDate(p.dateOfBirth)} (${petAge(p.dateOfBirth)})` : null },
                { label: "Weight", value: p.weightKg ? `${Number(p.weightKg)} kg` : null },
                { label: "Vaccinated", value: p.isVaccinated ? "Yes" : "No" },
                { label: "Added", value: formatDateTime(p.createdAt) },
                { label: "Owner", value: `${p.user.firstName} ${p.user.lastName} · ${p.user.email}`, full: true },
                { label: "Notes", value: p.notes, full: true },
              ]}
            />
          </div>
        )}
      </Modal>

      <CustomerDetailModal customer={owner.item} open={owner.isOpen} onOpenChange={owner.setOpen} />
    </>
  );
}
