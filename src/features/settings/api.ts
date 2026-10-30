"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { contactInfo } from "@/lib/site";
import { api } from "@/lib/api/request";
import type { PublicSettings } from "@/types/models";

/** Public business settings (booking window, cancel policy, currencies …). Rarely changes → cached 10 min. */
export const usePublicSettings = () =>
  useQuery({ queryKey: ["settings", "public"], queryFn: () => api.get<PublicSettings>("/settings/public"), staleTime: 10 * 60_000 });

/** Contact details (phone, email, address, socials) from settings with SITE fallbacks. Pass server-fetched settings to skip the loading flash. */
export function useContactInfo(initial?: PublicSettings | null) {
  const { data } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: () => api.get<PublicSettings>("/settings/public"),
    staleTime: 10 * 60_000,
    ...(initial && { initialData: initial }),
  });
  return useMemo(() => contactInfo(data), [data]);
}
