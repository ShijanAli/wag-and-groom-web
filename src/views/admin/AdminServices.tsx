"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Plus, Scissors, Star, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { ChipList } from "@/components/common/Chip";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { ChipsField, MultiSelectField } from "@/components/common/form/choice-fields";
import { FieldRow, SelectField, SwitchField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { FormSection } from "@/components/common/form/FormSection";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusSwitch } from "@/components/common/StatusSwitch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { formatDuration, formatMoney } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import {
  STATUS_OPTIONS,
  serviceHooks,
  useCategoryOptions,
  usePetTypeOptions,
  useServiceStatus,
  type ServiceInput,
} from "@/features/catalog/api";
import { useStaffOptions } from "@/features/staff/api";
import type { Service } from "@/types/models";

const money = (label: string) =>
  z.number({ required_error: `${label} is required`, invalid_type_error: `${label} is required` }).min(0, "Can't be negative").max(99_999_999);

const schema = z
  .object({
    name: z.string().trim().min(2, "At least 2 characters").max(150),
    categoryId: z.number({ required_error: "Choose a category" }).int().positive("Choose a category"),
    shortDescription: z.string().trim().max(255),
    description: z.string().trim().max(10_000),
    price: money("Price"),
    discountPrice: z.number().min(0).max(99_999_999).optional(),
    durationMinutes: z
      .number({ required_error: "Duration is required", invalid_type_error: "Duration is required" })
      .int()
      .min(5, "At least 5 minutes")
      .max(720, "At most 12 hours")
      .multipleOf(5, "Use steps of 5 minutes"),
    image: z.string().url().nullable(),
    petTypeIds: z.array(z.number()).min(1, "Select at least one pet type"),
    staffIds: z.array(z.number()),
    maxPetsPerBooking: z.number({ invalid_type_error: "Enter a number" }).int().min(1).max(10),
    sortOrder: z.number({ invalid_type_error: "Enter a number" }).int().min(0).max(100_000),
    isFeatured: z.boolean(),
    requiresVaccination: z.boolean(),
    status: z.enum(["active", "inactive"]),
  })
  .refine((v) => v.discountPrice === undefined || v.discountPrice < v.price, {
    path: ["discountPrice"],
    message: "Must be lower than the price",
  });
type Form = z.output<typeof schema>;

const toForm = (s: Service | null): z.input<typeof schema> => ({
  name: s?.name ?? "",
  categoryId: s?.categoryId ?? (undefined as unknown as number),
  shortDescription: s?.shortDescription ?? "",
  description: s?.description ?? "",
  price: s ? Number(s.price) : (undefined as unknown as number),
  discountPrice: s?.discountPrice ? Number(s.discountPrice) : undefined,
  durationMinutes: s?.durationMinutes ?? 60,
  image: s?.image ?? null,
  petTypeIds: s?.petTypes.map((t) => t.id) ?? [],
  staffIds: s?.staff?.map((m) => m.id) ?? [],
  maxPetsPerBooking: s?.maxPetsPerBooking ?? 1,
  sortOrder: s?.sortOrder ?? 0,
  isFeatured: s?.isFeatured ?? false,
  requiresVaccination: s?.requiresVaccination ?? false,
  status: s?.status ?? "active",
});

const toInput = (v: Form): ServiceInput => ({
  ...v,
  shortDescription: v.shortDescription || null,
  description: v.description || null,
  discountPrice: v.discountPrice ?? null,
});

const FEATURED_OPTIONS = [{ label: "Featured only", value: "true" }];

export default function AdminServices() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "sortOrder", sortOrder: "asc" } });
  const query = serviceHooks.useList(list.params);
  const categories = useCategoryOptions();
  const petTypes = usePetTypeOptions();
  const staff = useStaffOptions();
  const setStatus = useServiceStatus();

  const editor = useCrudEditor<Service, Form, ServiceInput>({ hooks: serviceHooks, entity: "service", toForm, toInput });
  // list rows don't include assigned staff → load the full service before editing
  const detail = serviceHooks.useOne(editor.item?.id);
  const loadingDetail = !!editor.item && editor.modalProps.open && !detail.data;
  const remove = useCrudDelete(serviceHooks, "service", (s: Service) => s.name);
  const canUpdate = can(P.SERVICE.UPDATE);

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: "name",
        header: "Service",
        enableSorting: true,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex min-w-[220px] items-center gap-3">
              {s.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail
                <img src={s.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Scissors className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate font-medium">
                  {s.name}
                  {s.isFeatured && <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-label="Featured" />}
                </p>
                <p className="truncate text-xs text-muted-foreground">{s.category.name}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "petTypes",
        header: "For",
        cell: ({ row }) => <ChipList items={row.original.petTypes} max={4} />,
      },
      {
        id: "price",
        header: "Price",
        enableSorting: true,
        cell: ({ row }) => {
          const { price, discountPrice } = row.original;
          return discountPrice ? (
            <div className="whitespace-nowrap">
              <span className="font-semibold text-primary">{formatMoney(discountPrice)}</span>{" "}
              <span className="text-xs text-muted-foreground line-through">{formatMoney(price)}</span>
            </div>
          ) : (
            <span className="whitespace-nowrap font-semibold">{formatMoney(price)}</span>
          );
        },
      },
      { id: "durationMinutes", header: "Duration", enableSorting: true, cell: ({ row }) => formatDuration(row.original.durationMinutes) },
      {
        id: "avgRating",
        header: "Rating",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.reviewsCount ? (
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {row.original.avgRating}
              <span className="text-xs text-muted-foreground">({row.original.reviewsCount})</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">No reviews</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <StatusSwitch
              active={s.status === "active"}
              label={`Toggle ${s.name}`}
              disabled={!canUpdate}
              pending={setStatus.isPending && setStatus.variables?.id === s.id}
              onToggle={(on) => setStatus.mutate({ id: s.id, status: on ? "active" : "inactive" })}
            />
          );
        },
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => editor.open(row.original), visible: canUpdate },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.SERVICE.DELETE) },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, canUpdate, remove, setStatus.isPending, setStatus.variables],
  );

  return (
    <>
      <PageHeader
        title="Services"
        description="Your service catalog — prices are in USD ($)."
        actions={
          <Can permission={P.SERVICE.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> New service
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No services yet"
        emptyDescription="Add categories and pet types first, then create your first service."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search services…"
            filters={
              <>
                <TableFilter list={list} param="categoryId" options={categories.data ?? []} allLabel="All categories" placeholder="Category" />
                <TableFilter list={list} param="petTypeId" options={petTypes.data ?? []} allLabel="All pet types" placeholder="Pet type" />
                <TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
                <TableFilter list={list} param="isFeatured" options={FEATURED_OPTIONS} allLabel="Featured & regular" placeholder="Featured" />
              </>
            }
          />
        }
      />

      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="status" aria-label="Loading service">
          <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
        </div>
      )}

      <FormModal
        schema={schema}
        size="lg"
        {...editor.modalProps}
        open={editor.modalProps.open && !loadingDetail}
        defaultValues={toForm(editor.item ? detail.data ?? null : null)}
      >
        <FormSection title="Basics">
          <TextField name="name" label="Name" placeholder="e.g. Full Grooming" required autoFocus />
          <SelectField name="categoryId" label="Category" options={categories.data ?? []} numeric required placeholder="Choose a category" />
          <TextField name="shortDescription" label="Short description" placeholder="One line shown on service cards" maxLength={255} />
          <TextareaField name="description" label="Full description" rows={4} placeholder="What's included, what to bring…" />
          <ImageUploadField name="image" label="Image" folder="services" />
        </FormSection>

        <FormSection title="Price & time">
          <FieldRow cols={3}>
            <TextField name="price" label="Price" type="number" min={0} step="0.01" leading="$" required />
            <TextField name="discountPrice" label="Sale price" type="number" min={0} step="0.01" leading="$" description="Optional" />
            <TextField name="durationMinutes" label="Duration (min)" type="number" min={5} max={720} step={5} required />
          </FieldRow>
        </FormSection>

        <FormSection title="Who it's for">
          <ChipsField name="petTypeIds" label="Pet types" options={petTypes.data ?? []} required />
          <MultiSelectField
            name="staffIds"
            label="Staff who provide it"
            options={staff.data ?? []}
            placeholder="Assign staff"
            searchPlaceholder="Search staff…"
            description="Only these staff can be booked for this service."
          />
        </FormSection>

        <FormSection title="Settings">
          <FieldRow>
            <TextField name="maxPetsPerBooking" label="Max pets per booking" type="number" min={1} max={10} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} description="Lower shows first." />
          </FieldRow>
          <SwitchField name="isFeatured" label="Featured" description="Highlight on the home page." />
          <SwitchField name="requiresVaccination" label="Requires vaccination" description="Customers must confirm vaccinations when booking." />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </FormSection>
      </FormModal>
    </>
  );
}
