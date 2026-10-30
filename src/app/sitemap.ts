import type { MetadataRoute } from "next";
import { serverGet } from "@/lib/api/server";
import { SITE } from "@/lib/site";
import type { AdoptionPet } from "@/types/models";

/** Regenerated hourly; adoptable pets come from the API (public statuses only). */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pets = (await serverGet<AdoptionPet[]>("/adoption-pets", { limit: 100, sortBy: "createdAt", sortOrder: "desc" }, 3600)) ?? [];
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/adopt`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...pets.map((p) => ({ url: `${SITE.url}/adopt/${p.slug}`, lastModified: new Date(p.createdAt), changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
