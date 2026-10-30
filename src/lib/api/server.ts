import "server-only";
import { API_URL } from "./client";
import type { ApiResponse, ListParams, Paginated } from "./types";
import { cacheTagFor } from "./cache-tags";

/**
 * Server-side GET for public data (SEO pages). Cached by Next with ISR (`revalidate` seconds).
 * Returns `null` when the API is unreachable so a page can still render (and refresh on the next revalidation).
 */
async function serverFetch<T>(path: string, params?: ListParams, revalidate = 300): Promise<ApiResponse<T> | null> {
  const qs = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && qs.set(k, String(v)));
  try {
    const res = await fetch(`${API_URL}${path}${qs.size ? `?${qs}` : ""}`, { next: { revalidate, tags: [cacheTagFor(path)] } });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

export const serverGet = async <T>(path: string, params?: ListParams, revalidate?: number) =>
  (await serverFetch<T>(path, params, revalidate))?.data ?? null;

export async function serverList<T>(path: string, params?: ListParams, revalidate?: number): Promise<Paginated<T> | null> {
  const res = await serverFetch<T[]>(path, params, revalidate);
  return res && res.meta ? { data: res.data, meta: res.meta } : null;
}
