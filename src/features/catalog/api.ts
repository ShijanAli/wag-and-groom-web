"use client";

import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/common/form/fields";
import { createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { Id } from "@/lib/api/types";
import type { ActiveStatus, PetType, Service, ServiceCategory } from "@/types/models";

/* ───────────────────────── inputs (match backend zod) ───────────────────────── */

export interface PetTypeInput {
  name: string;
  slug?: string;
  icon?: string | null;
  status: ActiveStatus;
}

export interface CategoryInput {
  parentId?: number | null;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  sortOrder?: number;
  status: ActiveStatus;
}

export interface ServiceInput {
  categoryId: number;
  name: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  durationMinutes: number;
  image?: string | null;
  status: ActiveStatus;
  isFeatured?: boolean;
  sortOrder?: number;
  maxPetsPerBooking?: number;
  requiresVaccination?: boolean;
  petTypeIds: number[];
  staffIds: number[];
}

/* ───────────────────────── resources ───────────────────────── */

export const petTypesApi = createResource<PetType, PetTypeInput>("/pet-types");
export const categoriesApi = {
  ...createResource<ServiceCategory, CategoryInput>("/service-categories"),
  tree: () => api.get<ServiceCategory[]>("/service-categories/tree"),
};
export const servicesApi = {
  ...createResource<Service, ServiceInput>("/services"),
  updateStatus: (id: Id, status: ActiveStatus) => api.patch<Service>(`/services/${id}/status`, { status }),
};

export const petTypeHooks = createResourceHooks("pet-types", petTypesApi);
export const categoryHooks = createResourceHooks("service-categories", categoriesApi);
export const serviceHooks = createResourceHooks("services", servicesApi);

export const useServiceStatus = () =>
  useApiMutation(({ id, status }: { id: Id; status: ActiveStatus }) => servicesApi.updateStatus(id, status), {
    revalidate: ["services"],
    invalidate: [serviceHooks.keys.all],
  });

/* ───────────────────────── select options (cached 5 min) ───────────────────────── */

const OPTIONS_STALE = 5 * 60_000;
const ALL = { limit: 100 } as const;

export const usePetTypeOptions = () =>
  useQuery({
    queryKey: petTypeHooks.keys.list({ ...ALL, sortBy: "name", sortOrder: "asc" }),
    queryFn: () => petTypesApi.list({ ...ALL, sortBy: "name", sortOrder: "asc" }),
    staleTime: OPTIONS_STALE,
    select: (r): Option<number>[] => r.data.map((t) => ({ value: t.id, label: t.name, disabled: t.status !== "active" })),
  });

/** Root categories first, children indented under their parent: "Grooming", "— Nail care". */
export const useCategoryOptions = ({ rootOnly = false }: { rootOnly?: boolean } = {}) =>
  useQuery({
    queryKey: categoryHooks.keys.list({ ...ALL, sortBy: "sortOrder", sortOrder: "asc" }),
    queryFn: () => categoriesApi.list({ ...ALL, sortBy: "sortOrder", sortOrder: "asc" }),
    staleTime: OPTIONS_STALE,
    select: (r): Option<number>[] => {
      const roots = r.data.filter((c) => !c.parentId);
      return roots.flatMap((root) => [
        { value: root.id, label: root.name },
        ...(rootOnly ? [] : r.data.filter((c) => c.parentId === root.id).map((c) => ({ value: c.id, label: `— ${c.name}` }))),
      ]);
    },
  });

export const useServiceOptions = () =>
  useQuery({
    queryKey: serviceHooks.keys.list({ ...ALL, sortBy: "name", sortOrder: "asc" }),
    queryFn: () => servicesApi.list({ ...ALL, sortBy: "name", sortOrder: "asc" }),
    staleTime: OPTIONS_STALE,
    select: (r): Option<number>[] => r.data.map((s) => ({ value: s.id, label: s.name })),
  });

export const STATUS_OPTIONS: Option<ActiveStatus>[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];
