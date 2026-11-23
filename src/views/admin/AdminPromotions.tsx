"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Pencil, Plus, Shuffle, Trash2, Users } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { MultiSelectField, SegmentedField } from "@/components/common/form/choice-fields";
import { FieldRow, SelectField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { FormSection } from "@/components/common/form/FormSection";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatusSwitch } from "@/components/common/StatusSwitch";
import { UserCell } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useListParams } from "@/hooks/use-list-params";
import { formatDate, formatDateTime, formatMoney, toDateTimeLocal } from "@/lib/format";
import { PERMISSIONS as P } from "@/lib/permissions";
import { STATUS_OPTIONS, useCategoryOptions, useServiceOptions } from "@/features/catalog/api";
import {
  DISCOUNT_TYPE_OPTIONS,
  SCOPE_OPTIONS,
  discountLabel,
  promotionHooks,
  promotionPhase,
  usePromotionUsages,
  type PromotionInput,
} from "@/features/promotions/api";
import type { Promotion, PromotionUsage } from "@/types/models";

const optionalMoney = z.number().min(0).max(99_999_999).optional();

const schema = z
  .object({
    title: z.string().trim().min(2, "At least 2 characters").max(150),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,50}$/, "3–50 letters, numbers, - or _"),
    description: z.string().trim().max(2000),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number({ required_error: "Enter the discount", invalid_type_error: "Enter the discount" }).positive("Must be greater than 0"),
    maxDiscountAmount: optionalMoney,
    minOrderAmount: optionalMoney,
    appliesTo: z.enum(["all", "specific_services", "specific_categories"]),
    serviceIds: z.array(z.number()),
    categoryIds: z.array(z.number()),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number({ invalid_type_error: "Enter a number" }).int().min(1).max(100),
    startsAt: z.string().min(1, "Start is required"),
    endsAt: z.string().min(1, "End is required"),
    bannerImage: z.string().url().nullable(),
    status: z.enum(["active", "inactive"]),
  })
  .superRefine((v, ctx) => {
    if (v.discountType === "percentage" && v.discountValue > 100) ctx.addIssue({ code: "custom", path: ["discountValue"], message: "Max 100%" });
    if (v.startsAt && v.endsAt && v.endsAt <= v.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Must be after the start" });
    if (v.appliesTo === "specific_services" && !v.serviceIds.length) ctx.addIssue({ code: "custom", path: ["serviceIds"], message: "Select at least one service" });
    if (v.appliesTo === "specific_categories" && !v.categoryIds.length) ctx.addIssue({ code: "custom", path: ["categoryIds"], message: "Select at least one category" });
  });
type Form = z.output<typeof schema>;

const num = (v: string | null | undefined) => (v === null || v === undefined ? undefined : Number(v));

function toForm(p: Promotion | null): z.input<typeof schema> {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 7 * 864e5);
  return {
    title: p?.title ?? "",
    code: p?.code ?? "",
    description: p?.description ?? "",
    discountType: p?.discountType ?? "percentage",
    discountValue: num(p?.discountValue) as number,
    maxDiscountAmount: num(p?.maxDiscountAmount),
    minOrderAmount: num(p?.minOrderAmount),
    appliesTo: p?.appliesTo ?? "all",
    serviceIds: p?.services.map((s) => s.id) ?? [],
    categoryIds: p?.categories.map((c) => c.id) ?? [],
    usageLimit: p?.usageLimit ?? undefined,
    perUserLimit: p?.perUserLimit ?? 1,
    startsAt: toDateTimeLocal(p?.startsAt ?? start.toISOString()),
    endsAt: toDateTimeLocal(p?.endsAt ?? end.toISOString()),
    bannerImage: p?.bannerImage ?? null,
    status: p?.status ?? "active",
  };
}

const toInput = (v: Form): PromotionInput => ({
  ...v,
  description: v.description || null,
  maxDiscountAmount: v.discountType === "percentage" ? v.maxDiscountAmount ?? null : null,
  minOrderAmount: v.minOrderAmount ?? null,
  usageLimit: v.usageLimit ?? null,
  serviceIds: v.appliesTo === "specific_services" ? v.serviceIds : [],
  categoryIds: v.appliesTo === "specific_categories" ? v.categoryIds : [],
  // datetime-local is the admin's local time → send an absolute instant
  startsAt: new Date(v.startsAt).toISOString(),
  endsAt: new Date(v.endsAt).toISOString(),
});

const scopeLabel = (p: Promotion) =>
  p.appliesTo === "all"
    ? "All services"
    : p.appliesTo === "specific_services"
      ? `${p.services.length} service${p.services.length === 1 ? "" : "s"}`
      : `${p.categories.length} categor${p.categories.length === 1 ? "y" : "ies"}`;

const copy = (code: string) => navigator.clipboard.writeText(code).then(() => toast.success(`Copied ${code}`));

export default function AdminPromotions() {
  const { can } = useAuth();
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = promotionHooks.useList(list.params);
  const services = useServiceOptions();
  const categories = useCategoryOptions();
  const usages = useDisclosure<Promotion>();
  const update = promotionHooks.useUpdate();
  const canUpdate = can(P.PROMOTION.UPDATE);

  const editor = useCrudEditor<Promotion, Form, PromotionInput>({ hooks: promotionHooks, entity: "promotion", toForm, toInput });
  const remove = useCrudDelete(promotionHooks, "promotion", (p: Promotion) => p.title);

  const columns = useMemo<ColumnDef<Promotion>[]>(
    () => [
      {
        id: "title",
        header: "Promotion",
        enableSorting: true,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="min-w-[180px]">
              <p className="font-medium">{p.title}</p>
              {p.code && (
                <button
                  type="button"
                  onClick={(e) => (e.stopPropagation(), copy(p.code!))}
                  className="mt-1 inline-flex items-center gap-1 rounded border border-dashed border-primary/50 bg-primary/5 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary hover:bg-primary/10"
                  title="Copy code"
                >
                  {p.code} <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        },
      },
      {
        id: "discount",
        header: "Discount",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <p className="font-semibold">{discountLabel(row.original)}</p>
            {row.original.minOrderAmount && <p className="text-xs text-muted-foreground">Min. order {formatMoney(row.original.minOrderAmount)}</p>}
          </div>
        ),
      },
      { id: "appliesTo", header: "Applies to", cell: ({ row }) => scopeLabel(row.original) },
      {
        id: "startsAt",
        header: "Validity",
        enableSorting: true,
        cell: ({ row }) => {
          const phase = promotionPhase(row.original);
          return (
            <div className="space-y-1 whitespace-nowrap">
              <StatusBadge status={phase.label} tone={phase.tone} />
              <p className="text-xs text-muted-foreground">
                {formatDate(row.original.startsAt, "d MMM")} – {formatDate(row.original.endsAt)}
              </p>
            </div>
          );
        },
      },
      {
        id: "usage",
        header: "Used",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {row.original.usedCount}
            <span className="text-muted-foreground"> / {row.original.usageLimit ?? "∞"}</span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusSwitch
            active={row.original.status === "active"}
            label={`Toggle ${row.original.title}`}
            disabled={!canUpdate}
            pending={update.isPending && update.variables?.id === row.original.id}
            onToggle={(on) => update.mutate({ id: row.original.id, data: { status: on ? "active" : "inactive" } })}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => editor.open(row.original), visible: canUpdate },
              { label: "Who used it", icon: Users, onClick: () => usages.open(row.original) },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.PROMOTION.DELETE) },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, canUpdate, remove, update.isPending, update.variables],
  );

  return (
    <>
      <PageHeader
        title="Promotions"
        description="Promo codes customers enter at checkout."
        actions={
          <Can permission={P.PROMOTION.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> New promotion
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No promotions yet"
        emptyDescription="Create a code like WELCOME10 to reward new customers."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search title or code…"
            filters={
              <>
                <TableFilter list={list} param="runningNow" options={[{ label: "Running now", value: "true" }]} allLabel="Any time" placeholder="When" />
                <TableFilter list={list} param="discountType" options={DISCOUNT_TYPE_OPTIONS} allLabel="All types" placeholder="Type" />
                <TableFilter list={list} param="appliesTo" options={SCOPE_OPTIONS} allLabel="Any scope" placeholder="Scope" />
                <TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
              </>
            }
          />
        }
      />

      <FormModal schema={schema} size="lg" {...editor.modalProps}>
        <FormSection title="Basics">
          <TextField name="title" label="Title" placeholder="e.g. Winter Grooming Week" required autoFocus />
          <CodeField />
          <TextareaField name="description" label="Description" rows={2} placeholder="Shown to customers on banners" />
        </FormSection>
        <FormSection title="Discount">
          <SegmentedField name="discountType" label="Type" options={DISCOUNT_TYPE_OPTIONS} />
          <DiscountFields />
        </FormSection>
        <FormSection title="Where it applies">
          <SegmentedField name="appliesTo" label="Applies to" options={SCOPE_OPTIONS} />
          <ScopeFields services={services.data ?? []} categories={categories.data ?? []} />
        </FormSection>
        <FormSection title="Limits & schedule">
          <FieldRow>
            <TextField name="startsAt" label="Starts" type="datetime-local" required />
            <TextField name="endsAt" label="Ends" type="datetime-local" required />
          </FieldRow>
          <FieldRow>
            <TextField name="usageLimit" label="Total uses" type="number" min={1} description="Empty = unlimited" />
            <TextField name="perUserLimit" label="Uses per customer" type="number" min={1} max={100} />
          </FieldRow>
          <ImageUploadField name="bannerImage" label="Banner image" folder="promotions" description="Optional — used on the website banner." />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </FormSection>
      </FormModal>

      <UsagesModal promotion={usages.item} open={usages.isOpen} onOpenChange={usages.setOpen} />
    </>
  );
}

function CodeField() {
  const { setValue } = useFormContext<Form>();
  const generate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => chars[b % chars.length]).join("");
    setValue("code", `PET${code}`, { shouldValidate: true, shouldDirty: true });
  };
  return (
    <div className="flex items-start gap-2">
      <TextField name="code" label="Code" placeholder="WINTER10" required className="flex-1" style={{ textTransform: "uppercase" }} />
      <Button type="button" variant="outline" className="mt-8" onClick={generate}>
        <Shuffle className="mr-1.5 h-4 w-4" /> Generate
      </Button>
    </div>
  );
}

function DiscountFields() {
  const type = useWatch({ name: "discountType" });
  const pct = type === "percentage";
  return (
    <FieldRow cols={3}>
      <TextField name="discountValue" label={pct ? "Percent off" : "Amount off"} type="number" min={0} max={pct ? 100 : undefined} step="0.01" leading={pct ? "%" : "$"} required />
      {pct && <TextField name="maxDiscountAmount" label="Max discount" type="number" min={0} leading="$" description="Optional cap" />}
      <TextField name="minOrderAmount" label="Min. order" type="number" min={0} leading="$" description="Optional" />
    </FieldRow>
  );
}

function ScopeFields({ services, categories }: { services: { value: number; label: React.ReactNode }[]; categories: { value: number; label: React.ReactNode }[] }) {
  const scope = useWatch({ name: "appliesTo" });
  if (scope === "specific_services")
    return <MultiSelectField name="serviceIds" label="Services" options={services} placeholder="Choose services" searchPlaceholder="Search services…" required />;
  if (scope === "specific_categories")
    return <MultiSelectField name="categoryIds" label="Categories" options={categories} placeholder="Choose categories" searchPlaceholder="Search categories…" required />;
  return null;
}

function UsagesModal({ promotion, open, onOpenChange }: { promotion: Promotion | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const list = useListParams({ syncUrl: false, defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = usePromotionUsages(open ? promotion?.id ?? null : null, list.params);
  const columns = useMemo<ColumnDef<PromotionUsage>[]>(
    () => [
      { id: "user", header: "Customer", cell: ({ row }) => <UserCell user={row.original.user} secondary={row.original.user.email} /> },
      { id: "booking", header: "Booking", cell: ({ row }) => <span className="font-mono text-xs">{row.original.booking.bookingNo}</span> },
      { id: "discountAmount", header: "Saved", cell: ({ row }) => formatMoney(row.original.discountAmount) },
      { id: "createdAt", header: "When", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    ],
    [],
  );
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title="Who used it" description={promotion ? `${promotion.title} · ${promotion.code}` : undefined}>
      <DataTable columns={columns} query={query} list={list} emptyTitle="Not used yet" className="border-0" />
    </Modal>
  );
}
