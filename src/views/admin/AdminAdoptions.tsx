"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CalendarClock, CheckCheck, FileText, PawPrint } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, TableDateRange, TableFilter } from "@/components/common/data-table";
import { DetailList } from "@/components/common/DetailList";
import { DateField } from "@/components/common/form/choice-fields";
import { TextareaField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { fullName } from "@/lib/auth";
import { formatDateTime, formatDay, toApiDate } from "@/lib/format";
import { cdn } from "@/lib/image";
import { PERMISSIONS as P } from "@/lib/permissions";
import { ADOPTION_STATUS_OPTIONS, useAdoption, useAdoptions, useCancelAdoption, useCompleteAdoption, useUpdateAdoption } from "@/features/adoption/api";
import { feeLabel } from "@/features/adoption/components";

import type { Adoption } from "@/types/models";

const STATUS_LABEL: Record<string, string> = { in_progress: "In progress" };

const datesSchema = z.object({
  adoptionDate: z.string().min(1, "Pick the handover date"),
  followUpDate: z.string(),
  contractFile: z.string().url().nullable(),
});
const cancelSchema = z.object({ reason: z.string().trim().min(3, "Tell us why (3+ characters)").max(500) });

export default function AdminAdoptions() {
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = useAdoptions(list.params);
  const view = useDisclosure<Adoption>();

  const columns = useMemo<ColumnDef<Adoption>[]>(
    () => [
      {
        id: "pet",
        header: "Pet",
        cell: ({ row }) => {
          const pet = row.original.adoptionPet;
          const img = pet.images[0]?.imageUrl;
          return (
            <div className="flex items-center gap-3">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element -- API thumbnail
                <img src={cdn(img, 80, 80)} alt="" loading="lazy" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <PawPrint className="h-4 w-4" />
                </span>
              )}
              <div>
                <p className="font-medium">{pet.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{row.original.application.applicationNo}</p>
              </div>
            </div>
          );
        },
      },
      { id: "user", header: "Adopter", cell: ({ row }) => (row.original.user ? <UserCell user={row.original.user} secondary={row.original.user.email} /> : "—") },
      {
        id: "fee",
        header: "Fee",
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="whitespace-nowrap">
              <p className="font-semibold">{feeLabel(a.feeAmount)}</p>
            </div>
          );
        },
      },
      { id: "adoptionDate", header: "Handover", enableSorting: true, cell: ({ row }) => formatDay(row.original.adoptionDate, "d MMM yyyy") },
      { id: "followUp", header: "Follow-up", cell: ({ row }) => (row.original.followUpDate ? formatDay(row.original.followUpDate, "d MMM yyyy") : <span className="text-muted-foreground">—</span>) },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} label={STATUS_LABEL[row.original.status]} /> },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Adoptions" description="Approved applications: hand the pet over and schedule a follow-up." />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={view.open}
        emptyTitle="No adoptions yet"
        emptyDescription="Approving an application creates an adoption here."
        toolbar={
          <DataTableToolbar
            list={list}
            filters={
              <>
                <TableFilter list={list} param="status" options={ADOPTION_STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
                <TableDateRange list={list} label="Handover" />
              </>
            }
          />
        }
      />
      <AdoptionModal id={view.item?.id ?? null} open={view.isOpen} onOpenChange={view.setOpen} />
    </>
  );
}

function AdoptionModal({ id, open, onOpenChange }: { id: number | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const q = useAdoption(open ? id : null);
  const dates = useDisclosure();
  const complete = useDisclosure();
  const cancel = useDisclosure();
  const update = useUpdateAdoption();
  const completeM = useCompleteAdoption();
  const cancelM = useCancelAdoption();
  const a = q.data;
  const active = a?.status === "in_progress";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Adoption"
      description={a ? `${a.adoptionPet.name} · ${a.application.applicationNo}` : undefined}
      footer={
        a &&
        active && (
          <Can permission={P.ADOPTION.UPDATE}>
            <div className="flex w-full flex-wrap justify-between gap-2">
              <div className="flex flex-wrap gap-2">

                <Button variant="outline" size="sm" onClick={() => dates.open()}>
                  <CalendarClock className="mr-1.5 h-4 w-4" /> Dates & contract
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => cancel.open()}>
                  <Ban className="mr-1.5 h-4 w-4" /> Cancel
                </Button>
              </div>
              <Button size="sm" onClick={() => complete.open()}>
                <CheckCheck className="mr-1.5 h-4 w-4" /> Complete handover
              </Button>
            </div>
          </Can>
        )
      }
    >
      {!a ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <StatusBadge status={a.status} label={STATUS_LABEL[a.status]} />

          </div>
          <DetailList
            items={[
              { label: "Adopter", value: a.user ? `${fullName(a.user)} · ${a.user.email}` : "—" },
              { label: "Fee", value: feeLabel(a.feeAmount) },
              { label: a.status === "completed" ? "Handed over" : "Planned handover", value: formatDay(a.adoptionDate) },
              { label: "Follow-up visit", value: a.followUpDate ? formatDay(a.followUpDate) : "Not scheduled" },
              {
                label: "Contract",
                value: a.contractFile ? (
                  <a href={a.contractFile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <FileText className="h-3.5 w-3.5" /> View contract
                  </a>
                ) : (
                  "Not uploaded"
                ),
              },
              ...(a.completedAt ? [{ label: "Completed", value: formatDateTime(a.completedAt) }] : []),
              ...(a.cancelReason ? [{ label: "Cancellation reason", value: a.cancelReason, full: true }] : []),
            ]}
          />

        </div>
      )}

      {a && (
        <>

          <FormModal
            open={dates.isOpen}
            onOpenChange={dates.setOpen}
            title="Dates & contract"
            schema={datesSchema}
            defaultValues={{ adoptionDate: a.adoptionDate, followUpDate: a.followUpDate ?? "", contractFile: a.contractFile }}
            submitText="Save"
            onSubmit={(v) => update.mutateAsync({ id: a.id, adoptionDate: v.adoptionDate, followUpDate: v.followUpDate || null, contractFile: v.contractFile })}
          >
            <DateField name="adoptionDate" label="Handover date" required />
            <DateField name="followUpDate" label="Follow-up visit" placeholder="Optional" />
            <ImageUploadField name="contractFile" label="Signed contract" folder="misc" description="Photo or scan of the signed adoption contract." />
          </FormModal>
          <FormModal
            open={complete.isOpen}
            onOpenChange={complete.setOpen}
            size="sm"
            title="Complete handover"
            description={`${a.adoptionPet.name} will be marked as adopted and removed from the website.`}
            schema={datesSchema}
            defaultValues={{ adoptionDate: toApiDate(new Date()), followUpDate: a.followUpDate ?? "", contractFile: a.contractFile }}
            submitText="Complete adoption"
            onSubmit={(v) => completeM.mutateAsync({ id: a.id, adoptionDate: v.adoptionDate, followUpDate: v.followUpDate || undefined, contractFile: v.contractFile ?? undefined })}
          >
            <DateField name="adoptionDate" label="Handover date" required />
            <DateField name="followUpDate" label="Follow-up visit" fromDate={new Date()} placeholder="Optional" />
            <ImageUploadField name="contractFile" label="Signed contract" folder="misc" />
          </FormModal>
          <FormModal
            open={cancel.isOpen}
            onOpenChange={cancel.setOpen}
            size="sm"
            title="Cancel adoption"
            description="The pet goes back to “available” on the website."
            schema={cancelSchema}
            defaultValues={{ reason: "" }}
            submitText="Cancel adoption"
            onSubmit={(v) => cancelM.mutateAsync({ id: a.id, reason: v.reason })}
          >
            <TextareaField name="reason" label="Reason" rows={3} required />
          </FormModal>
        </>
      )}
    </Modal>
  );
}
