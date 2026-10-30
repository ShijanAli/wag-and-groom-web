"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useWatch } from "react-hook-form";
import { Film, FolderOpen, GripVertical, ImageIcon, Images, Pencil, Plus, Save, Star, Trash2, Undo2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTablePagination, DataTableToolbar, RowActions, TableFilter } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/EmptyState";
import { FieldRow, SelectField, SwitchField, TextareaField, TextField } from "@/components/common/form/fields";
import { SegmentedField } from "@/components/common/form/choice-fields";
import { FormModal } from "@/components/common/form/FormModal";
import { FormSection } from "@/components/common/form/FormSection";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { ImageDropZone, useMultiUpload } from "@/components/common/MultiImageUpload";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatusSwitch } from "@/components/common/StatusSwitch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { useSortable } from "@/hooks/use-sortable";
import { useTabParam } from "@/hooks/use-tab-param";
import { cdn } from "@/lib/image";
import { PERMISSIONS as P } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS, useServiceOptions } from "@/features/catalog/api";
import {
  MEDIA_TYPE_OPTIONS,
  albumHooks,
  galleryItemHooks,
  useAlbumOptions,
  useBulkAddItems,
  useReorderItems,
  type AlbumInput,
  type GalleryItemInput,
} from "@/features/gallery/api";
import type { GalleryAlbum, GalleryItem } from "@/types/models";

const TABS = ["photos", "albums"] as const;
const NONE = 0;

export default function AdminGallery() {
  const [tab, setTab] = useTabParam(TABS, "photos");
  return (
    <>
      <PageHeader title="Gallery" description="Photos and videos for the website gallery and home page." />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="photos" className="gap-2">
            <Images className="h-4 w-4" /> Photos & videos
          </TabsTrigger>
          <TabsTrigger value="albums" className="gap-2">
            <FolderOpen className="h-4 w-4" /> Albums
          </TabsTrigger>
        </TabsList>
        <TabsContent value="photos" className="mt-4">
          <PhotosTab />
        </TabsContent>
        <TabsContent value="albums" className="mt-4">
          <AlbumsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ───────────────────────── photos ───────────────────────── */

const itemSchema = z
  .object({
    mediaType: z.enum(["image", "video"]),
    fileUrl: z.string().nullable(),
    videoUrl: z.string().trim(),
    thumbnailUrl: z.string().url().nullable(),
    beforeImageUrl: z.string().url().nullable(),
    title: z.string().trim().max(150),
    caption: z.string().trim().max(500),
    altText: z.string().trim().max(200),
    albumId: z.number().int(),
    serviceId: z.number().int(),
    isFeatured: z.boolean(),
    status: z.enum(["active", "inactive"]),
  })
  .superRefine((v, ctx) => {
    if (v.mediaType === "image" && !v.fileUrl) ctx.addIssue({ code: "custom", path: ["fileUrl"], message: "Upload an image" });
    if (v.mediaType === "video" && !z.string().url().safeParse(v.videoUrl).success) ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "Paste a YouTube, Vimeo or .mp4 link" });
  });
type ItemForm = z.output<typeof itemSchema>;

const orNull = (s: string) => s || null;
const idOrNull = (n: number) => (n === NONE ? null : n);

function PhotosTab() {
  const { can } = useAuth();
  const canUpdate = can(P.GALLERY.UPDATE);
  const list = useListParams({ defaults: { sortBy: "sortOrder", sortOrder: "asc", limit: 50 } });
  const query = galleryItemHooks.useList(list.params);
  const albums = useAlbumOptions();
  const services = useServiceOptions();
  const update = galleryItemHooks.useUpdate({ successMessage: false });
  const reorder = useReorderItems();
  const bulk = useBulkAddItems();
  const { upload, uploading } = useMultiUpload("gallery");
  const albumId = list.params.albumId ? Number(list.params.albumId) : null;

  const rows = query.data?.data;
  const source = useMemo(() => rows ?? [], [rows]);
  const sort = useSortable(source, (i) => i.id);
  // sorting is per album (or the album-less pool) — mixing albums would make the numbers meaningless
  const canSort = canUpdate && !list.params.searchTerm && !list.params.isFeatured && !list.params.mediaType;

  const editor = useCrudEditor<GalleryItem, ItemForm, GalleryItemInput>({
    hooks: galleryItemHooks,
    entity: "gallery item",
    toForm: (i) => ({
      mediaType: i?.mediaType ?? "image",
      fileUrl: i?.mediaType === "image" ? i.fileUrl : null,
      videoUrl: i?.mediaType === "video" ? i.fileUrl : "",
      thumbnailUrl: i?.thumbnailUrl ?? null,
      beforeImageUrl: i?.beforeImageUrl ?? null,
      title: i?.title ?? "",
      caption: i?.caption ?? "",
      altText: i?.altText ?? "",
      albumId: i?.albumId ?? albumId ?? NONE,
      serviceId: i?.serviceId ?? NONE,
      isFeatured: i?.isFeatured ?? false,
      status: i?.status ?? "active",
    }),
    toInput: ({ videoUrl, ...v }) => ({
      ...v,
      fileUrl: v.mediaType === "video" ? videoUrl : (v.fileUrl as string),
      beforeImageUrl: v.mediaType === "image" ? v.beforeImageUrl : null,
      thumbnailUrl: v.mediaType === "video" ? v.thumbnailUrl : null,
      title: orNull(v.title),
      caption: orNull(v.caption),
      altText: orNull(v.altText),
      albumId: idOrNull(v.albumId),
      serviceId: idOrNull(v.serviceId),
    }),
  });
  const remove = useCrudDelete(galleryItemHooks, "photo", (i: GalleryItem) => i.title ?? "this photo");

  const addFiles = async (files: File[]) => {
    const urls = await upload(files);
    if (!urls.length) return;
    bulk.mutate({
      albumId,
      items: urls.map((fileUrl, i) => {
        const name = files[i]?.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        return { fileUrl, ...(name && { title: name, altText: name }) };
      }),
    });
  };

  const saveOrder = () => {
    const offset = ((list.params.page as number) - 1) * (list.params.limit as number);
    reorder.mutate(sort.items.map((i, idx) => ({ id: i.id, sortOrder: offset + idx })));
  };

  const albumOptions = useMemo(() => [{ value: NONE, label: "No album" }, ...(albums.data ?? [])], [albums.data]);
  const serviceOptions = useMemo(() => [{ value: NONE, label: "Not linked" }, ...(services.data ?? [])], [services.data]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        list={list}
        searchPlaceholder="Search title or caption…"
        filters={
          <>
            <TableFilter list={list} param="albumId" options={albums.data ?? []} allLabel="All albums" placeholder="Album" />
            <TableFilter list={list} param="mediaType" options={MEDIA_TYPE_OPTIONS} allLabel="Photos & videos" placeholder="Type" />
            <TableFilter list={list} param="isFeatured" options={[{ label: "Featured", value: "true" }]} allLabel="Featured: any" placeholder="Featured" />
            <TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />
          </>
        }
        actions={
          <Can permission={P.GALLERY.CREATE}>
            <Button variant="outline" onClick={() => editor.open()}>
              <Film className="mr-2 h-4 w-4" /> Add video / details
            </Button>
          </Can>
        }
      />

      {sort.dirty && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
          <span>New order not saved yet.</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={sort.reset}>
              <Undo2 className="mr-1.5 h-4 w-4" /> Undo
            </Button>
            <Button size="sm" onClick={saveOrder} disabled={reorder.isPending}>
              <Save className="mr-1.5 h-4 w-4" /> Save order
            </Button>
          </div>
        </div>
      )}

      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Gallery items">
          <Can permission={P.GALLERY.CREATE}>
            <li>
              <ImageDropZone onFiles={addFiles} busy={uploading || bulk.isPending} max={30} className="h-full w-full" />
            </li>
          </Can>
          {sort.items.map((item) => (
            <li
              key={item.id}
              {...(canSort ? sort.itemProps(item.id) : {})}
              tabIndex={canSort ? 0 : undefined}
              aria-label={item.title ?? "Gallery item"}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[dragging]:scale-95 data-[dragging]:opacity-40",
                canSort && "cursor-grab active:cursor-grabbing",
                item.status === "inactive" && "opacity-60",
              )}
            >
              <Thumb item={item} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />
              <div className="absolute left-2 top-2 flex gap-1">
                {item.mediaType === "video" && <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">VIDEO</span>}
                {item.beforeImageUrl && <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">BEFORE/AFTER</span>}
                {item.status === "inactive" && <StatusBadge status="inactive" />}
              </div>
              {canSort && <GripVertical className="absolute right-2 top-2 h-4 w-4 text-white opacity-0 drop-shadow group-hover:opacity-100" aria-hidden />}
              <button
                type="button"
                disabled={!canUpdate}
                onClick={() => update.mutate({ id: item.id, data: { isFeatured: !item.isFeatured } })}
                aria-pressed={item.isFeatured}
                aria-label={item.isFeatured ? "Remove from home page" : "Feature on home page"}
                title={item.isFeatured ? "Featured on the home page" : "Feature on the home page"}
                className={cn(
                  "absolute bottom-2 left-2 rounded-full p-1.5 backdrop-blur transition-opacity",
                  item.isFeatured ? "bg-warning text-white" : "bg-black/40 text-white opacity-0 group-hover:opacity-100",
                )}
              >
                <Star className={cn("h-3.5 w-3.5", item.isFeatured && "fill-current")} />
              </button>
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {canUpdate && (
                  <Button size="icon" variant="secondary" className="h-7 w-7" aria-label="Edit" onClick={() => editor.open(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {can(P.GALLERY.DELETE) && (
                  <Button size="icon" variant="secondary" className="h-7 w-7 text-destructive" aria-label="Delete" onClick={() => remove(item)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {item.title && <p className="pointer-events-none absolute inset-x-2 bottom-11 truncate text-xs font-medium text-white opacity-0 group-hover:opacity-100">{item.title}</p>}
            </li>
          ))}
        </ul>
      )}

      {!query.isLoading && !sort.items.length && (
        <EmptyState icon={ImageIcon} title="No photos here yet" description="Drop images on the tile above — they upload and appear instantly." />
      )}
      {canSort && sort.items.length > 1 && <p className="text-xs text-muted-foreground">Tip: drag photos to reorder (or focus one and press Alt + ←/→), then save.</p>}
      {query.data && query.data.meta.total > 0 && <DataTablePagination meta={query.data.meta} onChange={list.setParams} />}

      <FormModal schema={itemSchema} size="lg" {...editor.modalProps}>
        <SegmentedField name="mediaType" label="Type" options={MEDIA_TYPE_OPTIONS} />
        <MediaFields />
        <FormSection title="Details">
          <FieldRow>
            <TextField name="title" label="Title" placeholder="e.g. Bella after her spa day" />
            <TextField name="altText" label="Alt text" placeholder="Describe the photo for screen readers" />
          </FieldRow>
          <TextareaField name="caption" label="Caption" rows={2} />
          <FieldRow>
            <SelectField name="albumId" label="Album" options={albumOptions} numeric />
            <SelectField name="serviceId" label="Linked service" options={serviceOptions} numeric />
          </FieldRow>
          <FieldRow>
            <SwitchField name="isFeatured" label="Feature on home page" />
            <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
          </FieldRow>
        </FormSection>
      </FormModal>
    </div>
  );
}

function MediaFields() {
  const type = useWatch({ name: "mediaType" });
  if (type === "video")
    return (
      <FieldRow>
        <TextField name="videoUrl" label="Video link" placeholder="https://youtu.be/…" required />
        <ImageUploadField name="thumbnailUrl" label="Thumbnail" folder="gallery" description="Optional poster image" />
      </FieldRow>
    );
  return (
    <FieldRow>
      <ImageUploadField name="fileUrl" label="Photo (after)" folder="gallery" />
      <ImageUploadField name="beforeImageUrl" label="Before photo" folder="gallery" description="Optional — shows a before/after slider" />
    </FieldRow>
  );
}

function Thumb({ item }: { item: GalleryItem }) {
  const src = item.mediaType === "video" ? item.thumbnailUrl : item.fileUrl;
  if (!src)
    return (
      <span className="flex h-full items-center justify-center">
        <Film className="h-8 w-8 text-muted-foreground" />
      </span>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cdn(src, 360, 360)} alt={item.altText ?? item.title ?? ""} loading="lazy" draggable={false} className="h-full w-full object-cover" />;
}

/* ───────────────────────── albums ───────────────────────── */

const albumSchema = z.object({
  title: z.string().trim().min(2, "At least 2 characters").max(150),
  description: z.string().trim().max(1000),
  coverImage: z.string().url().nullable(),
  sortOrder: z.number({ invalid_type_error: "Enter a number" }).int().min(0).max(100_000),
  status: z.enum(["active", "inactive"]),
});
type AlbumForm = z.output<typeof albumSchema>;

function AlbumsTab() {
  const { can } = useAuth();
  const canUpdate = can(P.GALLERY.UPDATE);
  const list = useListParams({ defaults: { sortBy: "sortOrder", sortOrder: "asc" } });
  const query = albumHooks.useList(list.params);
  const update = albumHooks.useUpdate({ successMessage: false });
  const router = useRouter();

  const editor = useCrudEditor<GalleryAlbum, AlbumForm, AlbumInput>({
    hooks: albumHooks,
    entity: "album",
    toForm: (a) => ({ title: a?.title ?? "", description: a?.description ?? "", coverImage: a?.coverImage ?? null, sortOrder: a?.sortOrder ?? 0, status: a?.status ?? "active" }),
    toInput: (v) => ({ ...v, description: v.description || null }),
  });
  const remove = useCrudDelete(albumHooks, "album", (a: GalleryAlbum) => a.title);

  const columns = useMemo<ColumnDef<GalleryAlbum>[]>(
    () => [
      {
        id: "title",
        header: "Album",
        enableSorting: true,
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex items-center gap-3">
              <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.cover && <img src={cdn(a.cover, 128, 96)} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </span>
              <div className="min-w-0">
                <p className="font-medium">{a.title}</p>
                {a.description && <p className="line-clamp-1 text-xs text-muted-foreground">{a.description}</p>}
              </div>
            </div>
          );
        },
      },
      { id: "itemCount", header: "Items", cell: ({ row }) => row.original.itemCount },
      { id: "sortOrder", header: "Order", enableSorting: true, cell: ({ row }) => row.original.sortOrder },
      {
        id: "status",
        header: "Visible",
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
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.GALLERY.DELETE) },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can, canUpdate, remove, update.isPending, update.variables],
  );

  // row click → that album's photos (the photos tab is the default, so no ?tab)
  const openAlbum = (a: GalleryAlbum) => router.replace(`/admin/gallery?albumId=${a.id}`, { scroll: false });

  return (
    <>
      <DataTable
        columns={columns}
        query={query}
        list={list}
        onRowClick={openAlbum}
        emptyTitle="No albums yet"
        emptyDescription="Group photos into albums like “Grooming day” or “Adopted & happy”."
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search albums…"
            filters={<TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />}
            actions={
              <Can permission={P.GALLERY.CREATE}>
                <Button onClick={() => editor.open()}>
                  <Plus className="mr-2 h-4 w-4" /> New album
                </Button>
              </Can>
            }
          />
        }
      />
      <FormModal schema={albumSchema} {...editor.modalProps}>
        <TextField name="title" label="Title" required autoFocus />
        <TextareaField name="description" label="Description" rows={2} />
        <ImageUploadField name="coverImage" label="Cover image" folder="gallery" description="Optional — the first photo is used otherwise." />
        <FieldRow>
          <TextField name="sortOrder" label="Order" type="number" min={0} />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
        </FieldRow>
      </FormModal>
    </>
  );
}
