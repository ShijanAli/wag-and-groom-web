"use client";

import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/common/form/fields";
import { useAuth } from "@/context/AuthContext";
import { createKeys, createResourceHooks, useApiMutation } from "@/lib/api/hooks";
import { api, createResource } from "@/lib/api/request";
import type { Id, ListParams } from "@/lib/api/types";
import type { Adoption, AdoptionApplication, AdoptionPet, ApplicationStatus, FavoritePet, HomeType, PetGender, PetSize } from "@/types/models";

/* ───────────────────────── adoption pets ───────────────────────── */

export interface AdoptionPetInput {
  petTypeId: number;
  name: string;
  breed?: string | null;
  gender: PetGender;
  ageMonths: number;
  size?: PetSize | null;
  color?: string | null;
  description: string;
  healthStatus?: string | null;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  adoptionFee?: number;
  isFeatured?: boolean;
  /** create only — later edits go through the image endpoints */
  images?: { imageUrl: string; isPrimary?: boolean }[];
}

/** pet status / photos show on /adopt and the home page */
const ADOPT_SITE = ["adoption-pets"] as const;

export const adoptionPetsApi = {
  ...createResource<AdoptionPet, AdoptionPetInput>("/adoption-pets"),
  setStatus: (id: Id, status: "available" | "on_hold") => api.patch<AdoptionPet>(`/adoption-pets/${id}/status`, { status }),
  addImages: (id: Id, urls: string[]) => api.post<AdoptionPet>(`/adoption-pets/${id}/images`, { images: urls.map((imageUrl) => ({ imageUrl })) }),
  setCover: (id: Id, imageId: Id) => api.patch<AdoptionPet>(`/adoption-pets/${id}/images/${imageId}/primary`),
  removeImage: (id: Id, imageId: Id) => api.delete<AdoptionPet>(`/adoption-pets/${id}/images/${imageId}`),
};
export const adoptionPetHooks = createResourceHooks("adoption-pets", adoptionPetsApi);
const petInvalidate = [adoptionPetHooks.keys.all];

export const useAdoptionPetStatus = () =>
  useApiMutation(({ id, status }: { id: Id; status: "available" | "on_hold" }) => adoptionPetsApi.setStatus(id, status), { invalidate: petInvalidate, revalidate: ADOPT_SITE });
export const useAddPetImages = () =>
  useApiMutation(({ id, urls }: { id: Id; urls: string[] }) => adoptionPetsApi.addImages(id, urls), { invalidate: petInvalidate, revalidate: ADOPT_SITE, successMessage: "Photos added" });
export const useSetPetCover = () =>
  useApiMutation(({ id, imageId }: { id: Id; imageId: Id }) => adoptionPetsApi.setCover(id, imageId), { invalidate: petInvalidate, revalidate: ADOPT_SITE, successMessage: "Cover photo updated" });
export const useRemovePetImage = () =>
  useApiMutation(({ id, imageId }: { id: Id; imageId: Id }) => adoptionPetsApi.removeImage(id, imageId), { invalidate: petInvalidate, revalidate: ADOPT_SITE, successMessage: "Photo removed" });

/** Public list (react-query, optionally seeded with server data). */
export const usePublicAdoptionPets = (params: ListParams, initialData?: Awaited<ReturnType<typeof adoptionPetsApi.list>>) =>
  useQuery({
    queryKey: [...adoptionPetHooks.keys.list(params), "public"],
    queryFn: () => adoptionPetsApi.list(params),
    placeholderData: (prev) => prev,
    initialData,
    // server HTML can be up to a minute old (ISR) → show it instantly, refresh in the background
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });

/* ───────────────────────── favorites ───────────────────────── */

const favoriteKeys = createKeys("favorites");

export const favoritesApi = {
  list: (params?: ListParams) => api.list<FavoritePet>("/me/favorites", params),
  add: (petId: Id) => api.put(`/me/favorites/${petId}`),
  remove: (petId: Id) => api.delete(`/me/favorites/${petId}`),
};

export const useMyFavorites = (params: ListParams) =>
  useQuery({ queryKey: favoriteKeys.list(params), queryFn: () => favoritesApi.list(params), placeholderData: (prev) => prev });

/**
 * Ids of the user's favourite pets (one small request, cached) → hearts on public pages,
 * which are server-rendered anonymously and so can't carry `isFavorite` themselves.
 */
export function useFavoriteIds() {
  const { status } = useAuth();
  const q = useQuery({
    queryKey: favoriteKeys.list({ limit: 100, ids: true }),
    queryFn: () => favoritesApi.list({ limit: 100 }),
    enabled: status === "authenticated",
    staleTime: 5 * 60_000,
    select: (r) => new Set(r.data.map((f) => f.id)),
  });
  return q.data ?? new Set<number>();
}

export const useToggleFavorite = () =>
  useApiMutation(({ id, on }: { id: Id; on: boolean }) => (on ? favoritesApi.add(id) : favoritesApi.remove(id)), {
    invalidate: [favoriteKeys.all, adoptionPetHooks.keys.all],
    successMessage: (_r, v) => (v.on ? "Saved to favourites" : "Removed from favourites"),
  });

/* ───────────────────────── applications ───────────────────────── */

export interface ApplicationInput {
  adoptionPetId: number;
  homeType: HomeType;
  hasYard: boolean;
  hasOtherPets: boolean;
  otherPetsDetails?: string;
  hasChildren: boolean;
  experience?: string;
  reason: string;
}

const appKeys = createKeys("adoption-applications");
const adoptionKeys = createKeys("adoptions");
const adoptionInvalidate = [appKeys.all, adoptionKeys.all, adoptionPetHooks.keys.all, ["payments"], ["my-payments"]];

export const applicationsApi = {
  apply: (body: ApplicationInput) => api.post<AdoptionApplication>("/adoption-applications", body),
  mine: (params?: ListParams) => api.list<AdoptionApplication>("/me/adoption-applications", params),
  withdraw: (idOrNo: Id, reason?: string) => api.patch(`/me/adoption-applications/${idOrNo}/cancel`, { reason }),
  list: (params?: ListParams) => api.list<AdoptionApplication>("/adoption-applications", params),
  get: (id: Id) => api.get<AdoptionApplication>(`/adoption-applications/${id}`),
  review: (id: Id, status: Exclude<ApplicationStatus, "pending" | "cancelled">, adminNote?: string) =>
    api.patch<AdoptionApplication>(`/adoption-applications/${id}/review`, { status, adminNote }),
};

export const useMyApplications = (params: ListParams, enabled = true) =>
  useQuery({ queryKey: [...appKeys.list(params), "mine"], queryFn: () => applicationsApi.mine(params), placeholderData: (prev) => prev, enabled });
export const useApplications = (params: ListParams) =>
  useQuery({ queryKey: [...appKeys.list(params), "admin"], queryFn: () => applicationsApi.list(params), placeholderData: (prev) => prev });
export const useApplication = (id: Id | null | undefined) =>
  useQuery({ queryKey: appKeys.detail(id ?? ""), queryFn: () => applicationsApi.get(id!), enabled: !!id });

export const useApply = () => useApiMutation(applicationsApi.apply, { invalidate: adoptionInvalidate, successMessage: false });
export const useWithdrawApplication = () =>
  useApiMutation(({ idOrNo, reason }: { idOrNo: Id; reason?: string }) => applicationsApi.withdraw(idOrNo, reason), { invalidate: adoptionInvalidate });
export const useReviewApplication = () =>
  useApiMutation(
    ({ id, status, adminNote }: { id: Id; status: Exclude<ApplicationStatus, "pending" | "cancelled">; adminNote?: string }) =>
      applicationsApi.review(id, status, adminNote),
    { invalidate: adoptionInvalidate, revalidate: ADOPT_SITE },
  );

/* ───────────────────────── adoptions ───────────────────────── */

export const adoptionsApi = {
  mine: (params?: ListParams) => api.list<Adoption>("/me/adoptions", params),
  myOne: (id: Id) => api.get<Adoption>(`/me/adoptions/${id}`),
  list: (params?: ListParams) => api.list<Adoption>("/adoptions", params),
  get: (id: Id) => api.get<Adoption>(`/adoptions/${id}`),
  update: (id: Id, body: { adoptionDate?: string; contractFile?: string | null; followUpDate?: string | null }) => api.patch<Adoption>(`/adoptions/${id}`, body),
  complete: (id: Id, body: { adoptionDate?: string; contractFile?: string; followUpDate?: string }) => api.patch<Adoption>(`/adoptions/${id}/complete`, body),
  cancel: (id: Id, reason: string) => api.patch<Adoption>(`/adoptions/${id}/cancel`, { reason }),
};

export const useMyAdoptions = (params: ListParams) =>
  useQuery({ queryKey: [...adoptionKeys.list(params), "mine"], queryFn: () => adoptionsApi.mine(params), placeholderData: (prev) => prev });
export const useMyAdoption = (id: Id | null | undefined) =>
  useQuery({ queryKey: [...adoptionKeys.detail(id ?? ""), "mine"], queryFn: () => adoptionsApi.myOne(id!), enabled: !!id });
export const useAdoptions = (params: ListParams) =>
  useQuery({ queryKey: [...adoptionKeys.list(params), "admin"], queryFn: () => adoptionsApi.list(params), placeholderData: (prev) => prev });
export const useAdoption = (id: Id | null | undefined) =>
  useQuery({ queryKey: [...adoptionKeys.detail(id ?? ""), "admin"], queryFn: () => adoptionsApi.get(id!), enabled: !!id });

export const useUpdateAdoption = () =>
  useApiMutation(({ id, ...body }: { id: Id; adoptionDate?: string; contractFile?: string | null; followUpDate?: string | null }) => adoptionsApi.update(id, body), {
    invalidate: adoptionInvalidate, revalidate: ADOPT_SITE,
  });
export const useCompleteAdoption = () =>
  useApiMutation(({ id, ...body }: { id: Id; adoptionDate?: string; contractFile?: string; followUpDate?: string }) => adoptionsApi.complete(id, body), {
    invalidate: adoptionInvalidate, revalidate: ADOPT_SITE,
  });
export const useCancelAdoption = () =>
  useApiMutation(({ id, reason }: { id: Id; reason: string }) => adoptionsApi.cancel(id, reason), { invalidate: adoptionInvalidate, revalidate: ADOPT_SITE });

/* ───────────────────────── labels & helpers ───────────────────────── */

/** 4 → "4 months", 18 → "1 yr 6 mos", 24 → "2 years" */
export function ageLabel(months: number) {
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} yr${y > 1 ? "s" : ""} ${m} mo${m > 1 ? "s" : ""}` : `${y} year${y > 1 ? "s" : ""}`;
}

export const ADOPTION_PET_STATUS_OPTIONS: Option<string>[] = [
  { value: "available", label: "Available" },
  { value: "pending", label: "Adoption in progress" },
  { value: "adopted", label: "Adopted" },
  { value: "on_hold", label: "On hold" },
];

export const APPLICATION_STATUS_OPTIONS: Option<ApplicationStatus>[] = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Withdrawn" },
];

export const ADOPTION_STATUS_OPTIONS = [
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Mirrors backend REVIEW_TRANSITIONS */
export const REVIEW_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ["under_review", "approved", "rejected"],
  under_review: ["approved", "rejected"],
  approved: [],
  rejected: [],
  cancelled: [],
};

export const AGE_FILTERS = [
  { value: "0-12", label: "Under 1 year" },
  { value: "12-36", label: "1–3 years" },
  { value: "36-400", label: "3+ years" },
];

export const FEE_FILTERS = [
  { value: "0", label: "Free" },
  { value: "2000", label: "Up to ৳2,000" },
  { value: "5000", label: "Up to ৳5,000" },
];

export const coverOf = (p: { primaryImage?: string | null; images?: { imageUrl: string }[] }) => p.primaryImage ?? p.images?.[0]?.imageUrl ?? null;
