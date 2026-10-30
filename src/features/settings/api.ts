"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/request";
import type { PublicSettings } from "@/types/models";

/** Public business settings (booking window, cancel policy, currencies …). Rarely changes → cached 10 min. */
export const usePublicSettings = () =>
  useQuery({ queryKey: ["settings", "public"], queryFn: () => api.get<PublicSettings>("/settings/public"), staleTime: 10 * 60_000 });
