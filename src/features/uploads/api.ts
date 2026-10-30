import { api } from "@/lib/api/request";
import type { UploadedImage } from "@/types/models";

/** Must match backend `UPLOAD_FOLDERS`. */
export type UploadFolder =
  | "users"
  | "pets"
  | "services"
  | "service-categories"
  | "adoption-pets"
  | "gallery"
  | "blog"
  | "reviews"
  | "promotions"
  | "misc";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const MAX_IMAGE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB ?? 5);

/** Client-side check before spending an upload round-trip. Returns an error message or null. */
export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG, WEBP, GIF or AVIF images are allowed.";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Image must be smaller than ${MAX_IMAGE_MB} MB.`;
  return null;
}

export const uploadsApi = {
  async image(file: File, folder: UploadFolder = "misc") {
    const form = new FormData();
    form.append("file", file);
    return (await api.upload<UploadedImage>("/uploads/image", form, { folder })).data;
  },
  async images(files: File[], folder: UploadFolder = "misc") {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return (await api.upload<UploadedImage[]>("/uploads/images", form, { folder })).data;
  },
};
