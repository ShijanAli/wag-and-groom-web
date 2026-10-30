"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, FileText, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Can } from "@/components/common/Can";
import { DataTable, DataTableToolbar, RowActions, TableFilter, TableTabs } from "@/components/common/data-table";
import { SelectField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatusSwitch } from "@/components/common/StatusSwitch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useCrudDelete, useCrudEditor } from "@/hooks/use-crud";
import { useListParams } from "@/hooks/use-list-params";
import { useTabParam } from "@/hooks/use-tab-param";
import { fullName } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { cdn } from "@/lib/image";
import { PERMISSIONS as P } from "@/lib/permissions";
import { STATUS_OPTIONS } from "@/features/catalog/api";
import { POST_STATUS_OPTIONS, blogCategoryHooks, blogPostHooks, postPhase, useBlogCategoryOptions, type BlogCategoryInput } from "@/features/blog/api";
import type { BlogCategory, BlogPost } from "@/types/models";

const TABS = ["posts", "categories"] as const;

export default function AdminBlog() {
  const [tab, setTab] = useTabParam(TABS, "posts");
  return (
    <>
      <PageHeader
        title="Blog"
        description="Tips, stories and news — good content brings visitors from Google."
        actions={
          <Can permission={P.BLOG.CREATE}>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="mr-2 h-4 w-4" /> New post
              </Link>
            </Button>
          </Can>
        }
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="posts" className="gap-2">
            <FileText className="h-4 w-4" /> Posts
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderTree className="h-4 w-4" /> Categories
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4">
          <PostsTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

function PostsTab() {
  const { can } = useAuth();
  const router = useRouter();
  const canUpdate = can(P.BLOG.UPDATE);
  const list = useListParams({ defaults: { sortBy: "createdAt", sortOrder: "desc" } });
  const query = blogPostHooks.useList(list.params);
  const categories = useBlogCategoryOptions();
  const remove = useCrudDelete(blogPostHooks, "post", (p: BlogPost) => p.title);
  const edit = (p: BlogPost) => router.push(`/admin/blog/${p.id}`);

  const columns = useMemo<ColumnDef<BlogPost>[]>(
    () => [
      {
        id: "title",
        header: "Post",
        enableSorting: true,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex min-w-[260px] items-center gap-3">
              <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.coverImage && <img src={cdn(p.coverImage, 128, 96)} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </span>
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium">{p.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">/{p.slug}</p>
              </div>
            </div>
          );
        },
      },
      { id: "category", header: "Category", cell: ({ row }) => row.original.category.name },
      { id: "author", header: "Author", cell: ({ row }) => <span className="whitespace-nowrap">{fullName(row.original.author)}</span> },
      {
        id: "publishedAt",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => {
          const phase = postPhase(row.original);
          return (
            <div className="space-y-1 whitespace-nowrap">
              <StatusBadge status={phase.label} tone={phase.tone} />
              {row.original.publishedAt && <p className="text-xs text-muted-foreground" title={formatDateTime(row.original.publishedAt)}>{formatDate(row.original.publishedAt)}</p>}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const p = row.original;
          return (
            <RowActions
              actions={[
                { label: "Edit", icon: Pencil, onClick: () => edit(p), visible: canUpdate },
                { label: "View on website", icon: ExternalLink, onClick: () => window.open(`/blog/${p.slug}`, "_blank"), visible: postPhase(p).label === "Published" },
                { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(p), visible: can(P.BLOG.DELETE) },
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
    <DataTable
      columns={columns}
      query={query}
      list={list}
      onRowClick={canUpdate ? edit : undefined}
      emptyTitle="No posts yet"
      emptyDescription="Write your first post — grooming tips and adoption stories work great."
      toolbar={
        <div className="space-y-3">
          <TableTabs list={list} options={POST_STATUS_OPTIONS} />
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search title or excerpt…"
            filters={<TableFilter list={list} param="categoryId" options={categories.data ?? []} allLabel="All categories" placeholder="Category" />}
          />
        </div>
      }
    />
  );
}

const categorySchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  status: z.enum(["active", "inactive"]),
});
type CategoryForm = z.output<typeof categorySchema>;

function CategoriesTab() {
  const { can } = useAuth();
  const canUpdate = can(P.BLOG.UPDATE);
  const list = useListParams({ defaults: { sortBy: "name", sortOrder: "asc" } });
  const query = blogCategoryHooks.useList(list.params);
  const update = blogCategoryHooks.useUpdate({ successMessage: false });
  const editor = useCrudEditor<BlogCategory, CategoryForm, BlogCategoryInput>({
    hooks: blogCategoryHooks,
    entity: "category",
    toForm: (c) => ({ name: c?.name ?? "", status: c?.status ?? "active" }),
    toInput: (v) => v,
  });
  const remove = useCrudDelete(blogCategoryHooks, "category", (c: BlogCategory) => c.name);

  const columns = useMemo<ColumnDef<BlogCategory>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">/blog?category={row.original.slug}</p>
          </div>
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
            pending={update.isPending && update.variables?.id === row.original.id}
            onToggle={(on) => update.mutate({ id: row.original.id, data: { status: on ? "active" : "inactive" } })}
          />
        ),
      },
      { id: "createdAt", header: "Created", enableSorting: true, cell: ({ row }) => formatDate(row.original.createdAt) },
      {
        id: "actions",
        header: "",
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => (
          <RowActions
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => editor.open(row.original), visible: canUpdate },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(row.original), visible: can(P.BLOG.DELETE) },
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
      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No categories yet"
        toolbar={
          <DataTableToolbar
            list={list}
            searchPlaceholder="Search categories…"
            filters={<TableFilter list={list} param="status" options={STATUS_OPTIONS} allLabel="All statuses" placeholder="Status" />}
            actions={
              <Can permission={P.BLOG.CREATE}>
                <Button variant="outline" onClick={() => editor.open()}>
                  <Plus className="mr-2 h-4 w-4" /> New category
                </Button>
              </Can>
            }
          />
        }
      />
      <FormModal schema={categorySchema} size="sm" {...editor.modalProps}>
        <TextField name="name" label="Name" required autoFocus />
        <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
      </FormModal>
    </>
  );
}
