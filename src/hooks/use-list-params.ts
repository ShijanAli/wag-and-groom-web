"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListParams } from "@/lib/api/types";

type Value = string | number | boolean | undefined | null;
export type ListParamsPatch = Partial<Record<string, Value>>;

interface Options {
  defaults?: ListParams;
  /** true (default): state lives in the URL → shareable, survives reload and back/forward. */
  syncUrl?: boolean;
}

const NUMERIC = new Set(["page", "limit"]);

const parse = (sp: URLSearchParams, defaults: ListParams): ListParams => {
  const out: ListParams = { page: 1, limit: 10, ...defaults };
  sp.forEach((v, k) => {
    out[k] = NUMERIC.has(k) ? Number(v) || out[k] : v;
  });
  return out;
};

/**
 * Table state (page / limit / search / sort / filters) as one object.
 * Any change other than `page` resets to page 1 — the classic "filtered to an empty page" bug can't happen.
 *
 * const { params, setParams } = useListParams({ defaults: { sortBy: "createdAt" } });
 * const { data } = serviceHooks.useList(params);
 */
export function useListParams({ defaults = {}, syncUrl = true }: Options = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [local, setLocal] = useState<ListParams>(() => ({ page: 1, limit: 10, ...defaults }));

  // `defaults` is usually an inline literal → key on its JSON so the memo stays stable.
  const defaultsKey = JSON.stringify(defaults);
  const params = useMemo(
    () => (syncUrl ? parse(new URLSearchParams(searchParams.toString()), JSON.parse(defaultsKey)) : local),
    [syncUrl, searchParams, local, defaultsKey],
  );

  const setParams = useCallback(
    (patch: ListParamsPatch) => {
      const next: ListParams = { ...params, ...patch };
      if (!("page" in patch)) next.page = 1;

      if (!syncUrl) return setLocal(next);

      const base: ListParams = { page: 1, limit: 10, ...JSON.parse(defaultsKey) };
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        // keep URLs short: omit empty values and anything equal to its default
        if (v === undefined || v === null || v === "" || v === "all" || base[k] === v) continue;
        sp.set(k, String(v));
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, syncUrl, router, pathname, defaultsKey],
  );

  const reset = useCallback(() => {
    if (!syncUrl) return setLocal({ page: 1, limit: 10, ...JSON.parse(defaultsKey) });
    router.replace(pathname, { scroll: false });
  }, [syncUrl, router, pathname, defaultsKey]);

  return { params, setParams, reset };
}

export type UseListParams = ReturnType<typeof useListParams>;
