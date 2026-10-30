"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CirclePause, CirclePlay, ExternalLink, Heart, Images, Loader2, PawPrint, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { SegmentedField } from "@/components/common/form/choice-fields";
import { FieldRow, SelectField, SwitchField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { FormSection } from "@/components/common/form/FormSection";
import { Modal } from "@/components/common/Modal";
import { ImageDropZone, MultiImageUploadField, useMultiUpload } from "@/components/common/MultiImageUpload";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { cdn } from "@/lib/image";
import { PERMISSIONS as P } from "@/lib/permissions";
import {
  ADOPTION_PET_STATUS_OPTIONS,
  adoptionPetHooks,
  ageLabel,
  coverOf,
  useAddPetImages,
  useAdoptionPetStatus,
  useRemovePetImage,
  useSetPetCover,
  type AdoptionPetInput,
} from "@/features/adoption/api";
import { feeLabel } from "@/features/adoption/components";
import { usePetTypeOptions } from "@/features/catalog/api";
import { SIZE_OPTIONS } from "@/features/pets/api";
import type { AdoptionPet } from "@/types/models";

const STATUS_LABEL: Record<string, string> = { pending: "In progress", on_hold: "On hold" };

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  petTypeId: z.number({ required_error: "Choose a type", invalid_type_error: "Choose a type" }).int().positive("Choose a type"),
  breed: z.string().trim().max(100),
  gender: z.enum(["male", "female"]),
  years: z.number({ invalid_type_error: "Enter a number" }).int().min(0).max(33),
  months: z.number({ invalid_type_error: "Enter a number" }).int().min(0).max(11),
  size: z.enum(["small", "medium", "large", ""]),
  color: z.string().trim().max(50),
  description: z.string().trim().min(10, "At least 10 characters").max(10_000),
  healthStatus: z.string().trim().max(2000),
  isVaccinated: z.boolean(),
  isNeutered: z.boolean(),
  adoptionFee: z.number({ invalid_type_error: "Enter a number" }).min(0).max(99_999_999),
  isFeatured: z.boolean(),
  images: z.array(z.string().url()).max(10),
});
type Form = z.output<typeof schema>;

const toForm = (p: AdoptionPet | null): z.input<typeof schema> => ({
  name: p?.name ?? "",
  petTypeId: p?.petTypeId ?? (undefined as unknown as number),
  breed: p?.breed ?? "",
  gender: p?.gender ?? "male",
  years: p ? Math.floor(p.ageMonths / 12) : 0,
  months: p ? p.ageMonths % 12 : 0,
  size: p?.size ?? "",
  color: p?.color ?? "",
  description: p?.description ?? "",
  healthStatus: p?.healthStatus ?? "",
  isVaccinated: p?.isVaccinated ?? false,
  isNeutered: p?.isNeutered ?? false,
  adoptionFee: p ? Number(p.adoptionFee) : 0,
  isFeatured: p?.isFeatured ?? false,
  images: [],
});

const toInput = ({ years, months, images, ...v }: Form, item: AdoptionPet | null): AdoptionPetInput => ({
  ...v,
  ageMonths: years * 12 + months,
  breed: v.breed || null,
  size: v.size || null,
  color: v.color || null,
  healthStatus: v.healthStatus || null,
  // photos of an existing pet are managed in the Photos dialog
  ...(!item && { images: images.map((imageUrl, i) => ({ imageUrl, isPrimary: i === 0 })) }),
});

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function AdminAdoptionPets() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = adoptionPetHooks.useList(list.params);
  const types = usePetTypeOptions();
  const setStatus = useAdoptionPetStatus();
  const photos = useDisclosure<AdoptionPet>();
  const editor = useCrudEditor<AdoptionPet, Form, AdoptionPetInput>({ hooks: adoptionPetHooks, entity: "pet", toForm, toInput });
  const remove = useCrudDelete(adoptionPetHooks, "pet", (p: AdoptionPet) => p.name);
  const canUpdate = can(P.ADOPTION_PET.UPDATE);

  const columns = useMemo<ColumnDef<AdoptionPet>[]>(
    () => [
      {
        id: "name",
        header: "Pet",
        enableSorting: true,
        cell: ({ row }) => {
          const p = row.original;
          const cover = coverOf(p);
          return (
            <div className="flex min-w-[200px] items-center gap-3">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- API thumbnail
                <img src={cdn(cover, 96, 96)} alt="" loading="lazy" className="h-11 w-11 rounded-lg object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <PawPrint className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium">
                  {p.name} {p.isFeatured && <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-label="Featured" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.petType.name}
                  {p.breed && ` · ${p.breed}`}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "ageMonths",
        header: "Age",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {ageLabel(row.original.ageMonths)} · {row.original.gender === "male" ? "M" : "F"}
          </span>
        ),
      },
      { id: "adoptionFee", header: "Fee", enableSorting: true, cell: ({ row }) => <span className="font-semibold">{feeLabel(row.original.adoptionFee)}</span> },
      {
        id: "favorites",
        header: "Saved",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3.5 w-3.5" /> {row.original._count?.favorites ?? 0}
          </span>
        ),
      },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} label={STATUS_LABEL[row.original.status]} /> },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const p = row.original;
          return (
            <RowActions
              actions={[
                { label: "Edit", icon: Pencil, onClick: () => editor.open(p), visible: canUpdate },
                { label: "Photos", icon: Images, onClick: () => photos.open(p), visible: canUpdate },
                {
                  label: "Put on hold",
                  icon: CirclePause,
                  onClick: () => setStatus.mutate({ id: p.id, status: "on_hold" }),
                  visible: canUpdate && p.status === "available",
                },
                {
                  label: "Make available",
                  icon: CirclePlay,
                  onClick: () => setStatus.mutate({ id: p.id, status: "available" }),
                  visible: canUpdate && p.status === "on_hold",
                },
                { label: "View on website", icon: ExternalLink, onClick: () => window.open(`/adopt/${p.slug}`, "_blank"), visible: ["available", "pending"].includes(p.status) },
                { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(p), visible: can(P.ADOPTION_PET.DELETE) },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, canUpdate, remove],
  );

  return (
    <>
      <PageHeader
        title="Pets for adoption"
        description="Animals listed on the website. Status moves to “In progress” when an application is approved."
        actions={
          <Can permission={P.ADOPTION_PET.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> List a pet
            </Button>
          </Can>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No pets listed yet"
        emptyDescription="List your first rescue — it appears on /adopt right away."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Name, breed, colour…"
            filters={
              <>
                <TableFilter list={list} param="status" options={ADOPTION_PET_STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
                <TableFilter list={list} param="petTypeId" options={types.data ?? []} allLabel="All animals" placeholder="Animal" />
                <TableFilter list={list} param="gender" options={GENDERS} allLabel="Any gender" placeholder="Gender" />
                <TableFilter list={list} param="isFeatured" options={[{ value: "true", label: "Featured only" }]} allLabel="Featured & regular" placeholder="Featured" />
              </>
            }
          />
        }
      />

      <FormModal schema={schema} size="lg" {...editor.modalProps}>
        <FormSection title="Basics">
          <FieldRow>
            <TextField name="name" label="Name" required autoFocus />
            <SelectField name="petTypeId" label="Animal" options={types.data ?? []} numeric required placeholder="Dog, cat…" />
          </FieldRow>
          <FieldRow>
            <TextField name="breed" label="Breed" placeholder="e.g. Beagle" />
            <TextField name="color" label="Colour" placeholder="e.g. Tricolor" />
          </FieldRow>
          <SegmentedField name="gender" label="Gender" options={GENDERS} />
          <FieldRow cols={3}>
            <TextField name="years" label="Age (years)" type="number" min={0} max={33} />
            <TextField name="months" label="+ months" type="number" min={0} max={11} />
            <SelectField name="size" label="Size" options={SIZE_OPTIONS} placeholder="Select size" />
          </FieldRow>
        </FormSection>
        <FormSection title="Story & health">
          <TextareaField name="description" label="About" rows={4} required placeholder="Personality, habits, ideal home…" />
          <TextareaField name="healthStatus" label="Health notes" rows={2} placeholder="Vaccines, deworming, conditions…" />
          <FieldRow>
            <SwitchField name="isVaccinated" label="Vaccinated" />
            <SwitchField name="isNeutered" label="Neutered / spayed" />
          </FieldRow>
        </FormSection>
        <FormSection title="Listing">
          <FieldRow>
            <TextField name="adoptionFee" label="Adoption fee" type="number" min={0} leading="৳" description="0 = free adoption" />
            <SwitchField name="isFeatured" label="Featured" description="Shown first on the website." className="self-end" />
          </FieldRow>
          {!editor.item && <MultiImageUploadField name="images" label="Photos" folder="adoption-pets" description="The first photo is the cover. Up to 10." />}
        </FormSection>
      </FormModal>

      <PhotosModal petId={photos.item?.id ?? null} name={photos.item?.name} open={photos.isOpen} onOpenChange={photos.setOpen} />
    </>
  );
}

/** Manage photos of an existing pet: add, set cover, remove. */
function PhotosModal({ petId, name, open, onOpenChange }: { petId: number | null; name?: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const detail = adoptionPetHooks.useOne(open ? petId : null);
  const add = useAddPetImages();
  const cover = useSetPetCover();
  const remove = useRemovePetImage();
  const { upload, uploading } = useMultiUpload("adoption-pets");
  const images = detail.data?.images ?? [];
  const busy = (m: { isPending: boolean; variables?: { imageId?: number | string } }, id: number) => m.isPending && m.variables?.imageId === id;

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title="Photos" description={name ? `${name} · the cover is shown on cards and search results` : undefined}>
      {detail.isPending ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element -- API image */}
              <img src={cdn(img.imageUrl, 300, 300)} alt="" className="h-full w-full object-cover" />
              {img.isPrimary && <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">COVER</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/60 p-2">
                {!img.isPrimary && (
                  <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" disabled={busy(cover, img.id)} onClick={() => cover.mutate({ id: petId!, imageId: img.id })}>
                    {busy(cover, img.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : "Make cover"}
                  </Button>
                )}
                <Button size="icon" variant="destructive" className="h-7 w-7" aria-label="Remove photo" disabled={busy(remove, img.id) || images.length === 1} onClick={() => remove.mutate({ id: petId!, imageId: img.id })}>
                  {busy(remove, img.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          ))}
          {images.length < 10 && (
            <ImageDropZone
              busy={uploading || add.isPending}
              max={10 - images.length}
              onFiles={async (files) => {
                const urls = await upload(files);
                if (urls.length) add.mutate({ id: petId!, urls });
              }}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
