"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Tabs that live in the URL (`?tab=pets`) so links, reloads and the back button keep the tab. */
export function useTabParam<T extends string>(tabs: readonly T[], fallback: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab") as T | null;
  const tab = raw && tabs.includes(raw) ? raw : fallback;

  const setTab = useCallback(
    (next: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (next === fallback) sp.delete("tab");
      else sp.set("tab", next);
      // other list params (page, filters) belong to the previous tab
      ["page", "searchTerm", "status", "period"].forEach((k) => sp.delete(k));
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, fallback],
  );

  return [tab, setTab] as const;
}
