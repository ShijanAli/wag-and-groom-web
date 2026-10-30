"use client";

import { useQuery } from "@tanstack/react-query";
import { createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { ActiveStatus, GalleryAlbum, GalleryItem, MediaType } from "@/types/models";

export interface AlbumInput {
  title: string;
  slug?: string;
  description?: string | null;
  coverImage?: string | null;
  sortOrder?: number;
  status: ActiveStatus;
}

export interface GalleryItemInput {
  albumId?: number | null;
  serviceId?: number | null;
  title?: string | null;
  caption?: string | null;
  mediaType: MediaType;
  fileUrl: string;
  thumbnailUrl?: string | null;
  beforeImageUrl?: string | null;
  altText?: string | null;
  isFeatured: boolean;
  sortOrder?: number;
  status: ActiveStatus;
}

export const albumHooks = createResourceHooks("gallery-albums", createResource<GalleryAlbum, AlbumInput>("/gallery/albums"));
export const galleryItemHooks = createResourceHooks("gallery-items", createResource<GalleryItem, GalleryItemInput>("/gallery/items"));

const invalidate = [galleryItemHooks.keys.all, albumHooks.keys.all];
const revalidate = ["gallery"] as const;

export const useBulkAddItems = () =>
  useApiMutation(
    (body: { albumId?: number | null; serviceId?: number | null; items: { fileUrl: string; title?: string; altText?: string }[] }) =>
      api.post<GalleryItem[]>("/gallery/items/bulk", body),
    { invalidate, revalidate, successMessage: (_, v) => `${v.items.length} photo${v.items.length === 1 ? "" : "s"} added` },
  );

export const useReorderItems = () =>
  useApiMutation((items: { id: number; sortOrder: number }[]) => api.patch("/gallery/items/reorder", { items }), { invalidate, revalidate, successMessage: "Order saved" });

/** Compact album list for selects/filters. */
export const useAlbumOptions = () =>
  useQuery({
    queryKey: [...albumHooks.keys.all, "options"],
    queryFn: () => api.get<GalleryAlbum[]>("/gallery/albums", { limit: 100, sortBy: "sortOrder", sortOrder: "asc" }),
    select: (rows) => rows.map((a) => ({ value: a.id, label: a.title })),
    staleTime: 60_000,
  });

export const MEDIA_TYPE_OPTIONS = [
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
];

/** YouTube/Vimeo/mp4 link → something an <iframe>/<video> can play. */
export function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "iframe" as const, src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe" as const, src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { kind: "video" as const, src: url };
}
