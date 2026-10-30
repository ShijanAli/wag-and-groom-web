"use client";

import { tokenStore } from "./client";
import type { CacheResource } from "./cache-tags";

let pending = new Set<CacheResource>();
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * After an admin write, tell Next to drop the cached public pages that read this resource.
 * Batched (several saves in a row → one request) and fire-and-forget: if it fails the
 * page still refreshes on its normal ISR timer.
 */
export function revalidateSite(resources: readonly CacheResource[]) {
  if (!resources.length || !tokenStore.get()) return;
  resources.forEach((r) => pending.add(r));
  timer ??= setTimeout(() => {
    const body = JSON.stringify({ resources: [...pending] });
    pending = new Set();
    timer = null;
    fetch("/api/revalidate", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tokenStore.get()}` }, body }).catch(() => {});
  }, 300);
}
