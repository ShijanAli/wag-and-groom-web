import type { MetadataRoute } from "next";
import { serverGet } from "@/lib/api/server";
import { SITE } from "@/lib/site";
import type { AdoptionPet, BlogPost, Service } from "@/types/models";

/** Regenerated hourly from the API (public data only: active services, published posts, adoptable pets). */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [pets, services, posts] = await Promise.all([
    serverGet<AdoptionPet[]>("/adoption-pets", { limit: 100, sortBy: "createdAt", sortOrder: "desc" }, 3600),
    serverGet<Service[]>("/services", { limit: 100 }, 3600),
    serverGet<BlogPost[]>("/blog/posts", { limit: 100 }, 3600),
  ]);
  const page = (path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number, lastModified: Date = now) => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    page("", "weekly", 1),
    page("/services", "weekly", 0.9),
    page("/adopt", "daily", 0.9),
    page("/blog", "daily", 0.8),
    page("/gallery", "weekly", 0.6),
    ...(services ?? []).map((s) => page(`/services/${s.slug}`, "weekly", 0.8, new Date(s.updatedAt))),
    ...(posts ?? []).map((p) => page(`/blog/${p.slug}`, "monthly", 0.7, new Date(p.updatedAt))),
    ...(pets ?? []).map((p) => page(`/adopt/${p.slug}`, "daily", 0.7, new Date(p.createdAt))),
  ];
}
