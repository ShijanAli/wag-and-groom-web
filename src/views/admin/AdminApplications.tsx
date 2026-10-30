"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Baby, Check, Eye, Home, PawPrint, Search, Trees, X } from "lucide-react";
import { z } from "zod";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { DetailList } from "@/components/common/DetailList";
import { TextareaField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { fullName } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { cdn } from "@/lib/image";
import { PERMISSIONS as P } from "@/lib/permissions";
import { APPLICATION_STATUS_OPTIONS, REVIEW_TRANSITIONS, useApplication, useApplications, useReviewApplication } from "@/features/adoption/api";
import { feeLabel } from "@/features/adoption/components";
import type { AdoptionApplication, ApplicationStatus } from "@/types/models";

type Decision = Exclude<ApplicationStatus, "pending" | "cancelled">;
const DECISION: Record<Decision, { label: string; icon: typeof Check; text: string }> = {
  under_review: { label: "Mark under review", icon: Search, text: "Lets the applicant know you're looking at it." },
  approved: { label: "Approve", icon: Check, text: "Creates the adoption, marks the pet “in progress” and rejects every other open application for this pet." },
  rejected: { label: "Reject", icon: X, text: "The applicant is emailed. Add a kind note explaining why." },
};
const STATUS_LABEL: Record<string, string> = { cancelled: "Withdrawn" };
const noteSchema = z.object({ adminNote: z.string().trim().max(1000) });
const YES_NO = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export default function AdminApplications() {
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = useApplications(list.params);
  const view = useDisclosure<AdoptionApplication>();

  const columns = useMemo<ColumnDef<AdoptionApplication>[]>(
    () => [
      {
        id: "createdAt",
        header: "Application",
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-xs font-semibold">{row.original.applicationNo}</p>
            <p className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</p>
          </div>
        ),
      },
      { id: "user", header: "Applicant", cell: ({ row }) => (row.original.user ? <UserCell user={row.original.user} secondary={row.original.user.phone ?? row.original.user.email} /> : "—") },
      {
        id: "pet",
        header: "Pet",
        cell: ({ row }) => {
          const pet = row.original.adoptionPet;
          const img = pet.images[0]?.imageUrl;
          return (
            <div className="flex items-center gap-2">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element -- API thumbnail
                <img src={cdn(img, 80, 80)} alt="" loading="lazy" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <PawPrint className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">{pet.name}</span>
            </div>
          );
        },
      },
      {
        id: "home",
        header: "Home",
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-flex items-center gap-1 capitalize">
                <Home className="h-3.5 w-3.5" /> {a.homeType}
              </span>
              {a.hasYard && <Trees className="h-3.5 w-3.5" aria-label="Has a yard" />}
              {a.hasChildren && <Baby className="h-3.5 w-3.5" aria-label="Children at home" />}
              {a.hasOtherPets && <PawPrint className="h-3.5 w-3.5" aria-label="Other pets" />}
            </div>
          );
        },
      },
      { id: "status", header: "Status", enableSorting: true, cell: ({ row }) => <StatusBadge status={row.original.status} label={STATUS_LABEL[row.original.status]} tone={row.original.status === "cancelled" ? "neutral" : undefined} /> },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => <RowActions actions={[{ label: "Open", icon: Eye, onClick: () => view.open(row.original) }]} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <PageHeader title="Adoption applications" description="Review who wants to adopt. Approving one closes the others for that pet." />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={view.open}
        emptyTitle="No applications yet"
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Application no., applicant or pet…"
            filters={
              <>
                <TableFilter list={list} param="status" options={APPLICATION_STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
                <TableFilter list={list} param="homeType" options={[{ value: "house", label: "House" }, { value: "apartment", label: "Apartment" }]} allLabel="Any home" placeholder="Home" />
                <TableFilter list={list} param="hasChildren" options={YES_NO} allLabel="Children: any" placeholder="Children" />
                <TableFilter list={list} param="hasOtherPets" options={YES_NO} allLabel="Other pets: any" placeholder="Other pets" />
              </>
            }
          />
        }
      />
      <ApplicationModal id={view.item?.id ?? null} open={view.isOpen} onOpenChange={view.setOpen} />
    </>
  );
}

function ApplicationModal({ id, open, onOpenChange }: { id: number | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { can } = useAuth();
  const q = useApplication(open ? id : null);
  const review = useReviewApplication();
  const [decision, setDecision] = useState<Decision | null>(null);
  const a = q.data;
  const next = a ? (REVIEW_TRANSITIONS[a.status] as Decision[]) : [];
  const yesNo = (v: boolean) => (v ? "Yes" : "No");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Application"
      description={a ? `${a.applicationNo} · ${a.adoptionPet.name}` : undefined}
      footer={
        a &&
        can(P.ADOPTION_APPLICATION.REVIEW) &&
        next.length > 0 && (
          <div className="flex w-full flex-wrap justify-end gap-2">
            {next.map((d) => {
              const { label, icon: Icon } = DECISION[d];
              return (
                <Button key={d} variant={d === "approved" ? "default" : d === "rejected" ? "destructive" : "outline"} onClick={() => setDecision(d)}>
                  <Icon className="mr-1.5 h-4 w-4" /> {label}
                </Button>
              );
            })}
          </div>
        )
      }
    >
      {!a ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={a.status} label={STATUS_LABEL[a.status]} />
            <span className="text-sm text-muted-foreground">
              Fee {feeLabel(a.adoptionPet.adoptionFee ?? 0)} · submitted {formatDateTime(a.createdAt)}
            </span>
          </div>
          {a.user && (
            <DetailList
              items={[
                { label: "Applicant", value: fullName(a.user) },
                { label: "Contact", value: [a.user.phone, a.user.email].filter(Boolean).join(" · ") },
                { label: "Address", value: a.user.address, full: true },
              ]}
            />
          )}
          <DetailList
            items={[
              { label: "Home", value: a.homeType === "house" ? "House" : "Apartment" },
              { label: "Yard / garden", value: yesNo(a.hasYard) },
              { label: "Children", value: yesNo(a.hasChildren) },
              { label: "Other pets", value: a.hasOtherPets ? a.otherPetsDetails ?? "Yes" : "No" },
              { label: "Experience", value: a.experience, full: true },
              { label: `Why ${a.adoptionPet.name}`, value: <span className="whitespace-pre-line">{a.reason}</span>, full: true },
            ]}
          />
          {(a.adminNote || a.reviewedBy) && (
            <div className="rounded-xl bg-muted/50 p-4 text-sm">
              <p className="font-medium">Review</p>
              {a.adminNote && <p className="mt-1">“{a.adminNote}”</p>}
              {a.reviewedBy && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {fullName(a.reviewedBy)} · {formatDateTime(a.reviewedAt)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <FormModal
        open={!!decision}
        onOpenChange={(o) => !o && setDecision(null)}
        size="sm"
        title={decision ? DECISION[decision].label : ""}
        description={decision ? DECISION[decision].text : undefined}
        schema={noteSchema}
        defaultValues={{ adminNote: "" }}
        submitText={decision ? DECISION[decision].label : "Save"}
        onSubmit={(v) => review.mutateAsync({ id: a!.id, status: decision!, adminNote: v.adminNote || undefined })}
      >
        <TextareaField name="adminNote" label="Note to the applicant" rows={3} placeholder={decision === "rejected" ? "e.g. We're looking for a home with a garden for Bella." : "Optional"} />
      </FormModal>
    </Modal>
  );
}
