"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { FieldRow, SelectField, SwitchField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { PageHeader } from "@/components/common/PageHeader";
import { RatingField, Stars } from "@/components/common/Rating";
import { StatusSwitch } from "@/components/common/StatusSwitch";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { PERMISSIONS as P } from "@/lib/permissions";
import { STATUS_OPTIONS } from "@/features/catalog/api";
import { testimonialHooks, type TestimonialInput } from "@/features/content/api";
import { RATING_OPTIONS } from "@/features/reviews/api";
import type { Testimonial } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  content: z.string().trim().min(10, "At least 10 characters").max(2000),
  image: z.string().url().nullable(),
  rating: z.number({ required_error: "Pick a rating" }).int().min(1).max(5),
  isFeatured: z.boolean(),
  status: z.enum(["active", "inactive"]),
});
type Form = z.output<typeof schema>;

const avatarUser = (t: Testimonial) => ({ firstName: t.name.split(" ")[0], lastName: t.name.split(" ").slice(1).join(" "), profilePhoto: t.image });

export default function AdminTestimonials() {
  const { can } = useAuth();
  const canUpdate = can(P.TESTIMONIAL.UPDATE);
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = testimonialHooks.useList(list.params);
  const update = testimonialHooks.useUpdate({ successMessage: false });

  const editor = useCrudEditor<Testimonial, Form, TestimonialInput>({
    hooks: testimonialHooks,
    entity: "testimonial",
    toForm: (t) => ({ name: t?.name ?? "", content: t?.content ?? "", image: t?.image ?? null, rating: t?.rating ?? 5, isFeatured: t?.isFeatured ?? true, status: t?.status ?? "active" }),
    toInput: (v) => v,
  });
  const remove = useCrudDelete(testimonialHooks, "testimonial", (t: Testimonial) => t.name);

  const columns = useMemo<ColumnDef<Testimonial>[]>(
    () => [
      {
        id: "name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar user={avatarUser(row.original)} />
            <div>
              <p className="font-medium">{row.original.name}</p>
              <Stars value={row.original.rating} size="sm" />
            </div>
          </div>
        ),
      },
      { id: "content", header: "Testimonial", cell: ({ row }) => <p className="line-clamp-2 min-w-[240px] max-w-lg text-sm text-muted-foreground">“{row.original.content}”</p> },
      {
        id: "isFeatured",
        header: "Home page",
        cell: ({ row }) => (
          <button
            type="button"
            disabled={!canUpdate}
            onClick={(e) => (e.stopPropagation(), update.mutate({ id: row.original.id, data: { isFeatured: !row.original.isFeatured } }))}
            aria-pressed={row.original.isFeatured}
            title={row.original.isFeatured ? "Shown on the home page — click to hide" : "Click to feature on the home page"}
            className="rounded-md p-1 hover:bg-muted disabled:pointer-events-none"
          >
            <Star className={row.original.isFeatured ? "h-5 w-5 fill-warning text-warning" : "h-5 w-5 text-muted-foreground/50"} />
          </button>
        ),
      },
      {
        id: "status",
        header: "Visible",
        cell: ({ row }) => (
          <StatusSwitch
            active={row.original.status === "active"}
            label={`Toggle ${row.original.name}`}
            disabled={!canUpdate}
            pending={update.isPending && update.variables?.id === row.original.id && "status" in (update.variables?.data ?? {})}
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
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.TESTIMONIAL.DELETE) },
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
        title="Testimonials"
        description="Hand-picked quotes for the website. Starred ones appear on the home page."
        actions={
          <Can permission={P.TESTIMONIAL.CREATE}>
            <Button onClick={() => editor.open()}>
              <Plus className="mr-2 h-4 w-4" /> New testimonial
            </Button>
          </Can>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={canUpdate ? editor.open : undefined}
        emptyTitle="No testimonials yet"
        emptyDescription="Add a few kind words from happy customers to build trust."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search name or text…"
            filters={
              <>
                <TableFilter list={list} param="isFeatured" options={[{ label: "Featured", value: "true" }, { label: "Not featured", value: "false" }]} allLabel="Featured: any" placeholder="Featured" />
                <TableFilter list={list} param="rating" options={RATING_OPTIONS} allLabel="Any rating" placeholder="Rating" />
                <TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
              </>
            }
          />
        }
      />
      <FormModal schema={schema} {...editor.modalProps}>
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <ImageUploadField name="image" label="Photo" folder="misc" aspect="square" />
          <div className="space-y-4">
            <TextField name="name" label="Name" placeholder="e.g. Sadia Rahman" required autoFocus />
            <RatingField name="rating" label="Rating" required />
          </div>
        </div>
        <TextareaField name="content" label="What they said" rows={4} required maxLength={2000} />
        <FieldRow>
          <SwitchField name="isFeatured" label="Feature on home page" />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </FieldRow>
      </FormModal>
    </>
  );
}
