/**
 * Cache tags for server-rendered (ISR) public pages.
 * Every API read on the server is tagged by its first path segment ("/blog/posts/x" → "api:blog"),
 * and admin writes revalidate that tag → the website shows the change on the next request
 * instead of waiting for the ISR timer.
 */
export const CACHE_RESOURCES = [
  "services",
  "service-categories",
  "pet-types",
  "promotions",
  "adoption-pets",
  "blog",
  "faqs",
  "testimonials",
  "gallery",
  "settings",
] as const;
export type CacheResource = (typeof CACHE_RESOURCES)[number];

export const cacheTagFor = (path: string) => `api:${path.split("/")[1] ?? ""}`;

/** `/services/x/reviews` and rating summaries live under services → reviews revalidate "services". */
export function resourceOf(path: string): CacheResource | null {
  const seg = path.split("/")[1] as CacheResource;
  if (path.startsWith("/reviews")) return "services";
  return (CACHE_RESOURCES as readonly string[]).includes(seg) ? seg : null;
}
