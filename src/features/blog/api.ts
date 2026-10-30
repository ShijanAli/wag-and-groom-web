"use client";

import { useQuery } from "@tanstack/react-query";
import { createResourceHooks } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { ActiveStatus, BlogCategory, BlogPost, PostStatus } from "@/types/models";

export interface BlogCategoryInput {
  name: string;
  slug?: string;
  status: ActiveStatus;
}

export interface BlogPostInput {
  categoryId: number;
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status: PostStatus;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export const blogCategoryHooks = createResourceHooks("blog-categories", createResource<BlogCategory, BlogCategoryInput>("/blog/categories"));
export const blogPostHooks = createResourceHooks("blog-posts", createResource<BlogPost, BlogPostInput>("/blog/posts"));

export const useBlogCategoryOptions = () =>
  useQuery({
    queryKey: [...blogCategoryHooks.keys.all, "options"],
    queryFn: () => api.get<BlogCategory[]>("/blog/categories", { limit: 100 }),
    select: (rows) => rows.map((c) => ({ value: c.id, label: c.status === "active" ? c.name : `${c.name} (inactive)` })),
    staleTime: 60_000,
  });

/** Draft / Scheduled / Published, from status + publishedAt. */
export function postPhase(p: Pick<BlogPost, "status" | "publishedAt">) {
  if (p.status === "draft") return { label: "Draft", tone: "neutral" as const };
  if (p.publishedAt && new Date(p.publishedAt).getTime() > Date.now()) return { label: "Scheduled", tone: "info" as const };
  return { label: "Published", tone: "success" as const };
}

export const POST_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];
