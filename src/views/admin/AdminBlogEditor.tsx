"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { ArrowLeft, CalendarClock, ExternalLink, Eye, Save, Send } from "lucide-react";
import { z } from "zod";
import { AppForm, useZodForm } from "@/components/common/form/AppForm";
import { SegmentedField } from "@/components/common/form/choice-fields";
import { SelectField, TextareaField, TextField } from "@/components/common/form/fields";
import { MarkdownField } from "@/components/common/form/MarkdownField";
import { SubmitButton } from "@/components/common/form/SubmitButton";
import { FullPageLoader } from "@/components/common/FullPageLoader";
import { ImageUploadField } from "@/components/common/ImageUpload";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, toDateTimeLocal } from "@/lib/format";
import { SITE } from "@/lib/site";
import { POST_STATUS_OPTIONS, blogPostHooks, postPhase, useBlogCategoryOptions, type BlogPostInput } from "@/features/blog/api";
import type { BlogPost } from "@/types/models";

const schema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(200),
  slug: z
    .string()
    .trim()
    .max(220)
    .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lower-case letters, numbers and dashes"),
  excerpt: z.string().trim().max(300),
  content: z.string().trim().min(20, "Write at least a couple of sentences"),
  coverImage: z.string().url().nullable(),
  categoryId: z.number({ required_error: "Pick a category", invalid_type_error: "Pick a category" }).int().positive("Pick a category"),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string(),
  metaTitle: z.string().trim().max(200),
  metaDescription: z.string().trim().max(300),
});
type Form = z.output<typeof schema>;

const toForm = (p?: BlogPost): z.input<typeof schema> => ({
  title: p?.title ?? "",
  slug: p?.slug ?? "",
  excerpt: p?.excerpt ?? "",
  content: p?.content ?? "",
  coverImage: p?.coverImage ?? null,
  categoryId: p?.categoryId as number,
  status: p?.status ?? "draft",
  publishedAt: toDateTimeLocal(p?.publishedAt),
  metaTitle: p?.metaTitle ?? "",
  metaDescription: p?.metaDescription ?? "",
});

const toInput = (v: Form): BlogPostInput => ({
  ...v,
  slug: v.slug || undefined,
  excerpt: v.excerpt || null,
  metaTitle: v.metaTitle || null,
  metaDescription: v.metaDescription || null,
  // empty = "now" when publishing (backend default); a future date schedules the post
  publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString() : v.status === "draft" ? null : undefined,
});

export default function AdminBlogEditor({ id }: { id?: number }) {
  const query = blogPostHooks.useOne(id);
  if (id && query.isLoading) return <FullPageLoader label="Loading post…" />;
  if (id && !query.data) return <EmptyState title="Post not found" description="It may have been deleted." action={<Button asChild variant="outline"><Link href="/admin/blog">Back to blog</Link></Button>} />;
  return <Editor post={query.data} key={query.data?.id ?? "new"} />;
}

function Editor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const create = blogPostHooks.useCreate({ successMessage: "Post created" });
  const update = blogPostHooks.useUpdate({ successMessage: "Post saved" });
  const categories = useBlogCategoryOptions();
  const form = useZodForm(schema, { defaultValues: toForm(post) });
  const dirty = form.formState.isDirty;

  // don't lose a long post to an accidental tab close
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onSubmit = async (v: Form) => {
    if (post) {
      await update.mutateAsync({ id: post.id, data: toInput(v) });
      form.reset(v, { keepValues: true }); // saved → not dirty any more
      return;
    }
    const res = await create.mutateAsync(toInput(v));
    form.reset(v); // clear dirty before navigating
    router.replace(`/admin/blog/${res.data.id}`);
  };

  const phase = post && postPhase(post);

  return (
    <AppForm form={form} onSubmit={onSubmit}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to blog">
            <Link href="/admin/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
              {post ? "Edit post" : "New post"} {phase && <StatusBadge status={phase.label} tone={phase.tone} />}
            </h1>
            {post && <p className="text-sm text-muted-foreground">Last saved {formatDateTime(post.updatedAt)}{dirty && " · unsaved changes"}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {post && phase?.label === "Published" && (
            <Button variant="outline" asChild>
              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> View
              </a>
            </Button>
          )}
          <SaveButton live={phase?.label === "Published"} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <TextField name="title" label="Title" placeholder="5 grooming habits every dog needs" required className="[&_input]:h-12 [&_input]:text-lg [&_input]:font-semibold" />
          <TextareaField name="excerpt" label="Excerpt" rows={2} maxLength={300} description="Shown on blog cards and in Google results (if no meta description)." />
          <MarkdownField name="content" label="Content" required folder="blog" placeholder={"## A heading\n\nWrite your post here. Use the toolbar for bold, links, lists and images."} />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SegmentedField name="status" options={POST_STATUS_OPTIONS} />
              <PublishDate />
              <SelectField name="categoryId" label="Category" options={categories.data ?? []} numeric required placeholder="Choose…" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cover image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploadField name="coverImage" folder="blog" description="1200 × 630 works best for social sharing." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField name="slug" label="URL slug" placeholder="auto from title" leading="/blog/" />
              <TextField name="metaTitle" label="Meta title" maxLength={200} />
              <TextareaField name="metaDescription" label="Meta description" rows={3} maxLength={300} />
              <SearchPreview />
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppForm>
  );
}

function SaveButton({ live }: { live?: boolean }) {
  const status = useWatch({ name: "status" });
  const at = useWatch({ name: "publishedAt" }) as string;
  const scheduled = status === "published" && at && new Date(at).getTime() > Date.now();
  if (status === "draft") return <SubmitButton icon={<Save className="mr-2 h-4 w-4" />} pendingText="Saving…">Save draft</SubmitButton>;
  return (
    <SubmitButton icon={scheduled ? <CalendarClock className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />} pendingText="Saving…">
      {scheduled ? "Schedule" : live ? "Update" : "Publish"}
    </SubmitButton>
  );
}

function PublishDate() {
  const status = useWatch({ name: "status" });
  return (
    <TextField
      name="publishedAt"
      label={status === "draft" ? "Publish date (optional)" : "Publish date"}
      type="datetime-local"
      description={status === "draft" ? "Kept for when you publish." : "Empty = now. A future date schedules the post."}
    />
  );
}

/** How the post will look as a Google result. */
function SearchPreview() {
  const { control } = useFormContext();
  const [title, metaTitle, excerpt, metaDescription, slug] = useWatch({ control, name: ["title", "metaTitle", "excerpt", "metaDescription", "slug"] }) as string[];
  const shownTitle = (metaTitle || title || "Post title").slice(0, 60);
  const desc = (metaDescription || excerpt || "Add an excerpt or meta description so people know what the post is about.").slice(0, 160);
  return (
    <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Eye className="h-3.5 w-3.5" /> Google preview
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {SITE.url.replace(/^https?:\/\//, "")} › blog › {slug || "…"}
      </p>
      <p className="line-clamp-1 text-[15px] font-medium text-sky-700 dark:text-sky-400">
        {shownTitle} | {SITE.name}
      </p>
      <p className="line-clamp-2 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
