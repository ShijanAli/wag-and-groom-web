import "server-only";
import { API_URL } from "./client";
import type { ApiResponse, ListParams } from "./types";

/**
 * Server-side GET for public data (SEO pages). Cached by Next with ISR (`revalidate` seconds).
 * Returns `null` when the API is unreachable so a page can still render (and refresh on the next revalidation).
 */
export async function serverGet<T>(path: string, params?: ListParams, revalidate = 300): Promise<T | null> {
  const qs = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && qs.set(k, String(v)));
  try {
    const res = await fetch(`${API_URL}${path}${qs.size ? `?${qs}` : ""}`, { next: { revalidate } });
    if (!res.ok) return null;
    return ((await res.json()) as ApiResponse<T>).data;
  } catch {
    return null;
  }
}
