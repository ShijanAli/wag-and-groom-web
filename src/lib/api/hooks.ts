"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage, getFieldErrors } from "./errors";
import type { Resource } from "./request";
import type { ApiResponse, Id, ListParams, Paginated } from "./types";

interface MutationConfig<TData, TVars> {
  /** Query keys to invalidate on success (prefix match). */
  invalidate?: QueryKey[];
  /** `false` = no toast. Default: the backend's message. */
  successMessage?: string | false | ((data: TData, vars: TVars) => string);
  /** Default true. Validation errors with field details are never toasted — forms show them inline. */
  errorToast?: boolean;
  onSuccess?: (data: TData, vars: TVars) => void;
}

/**
 * useMutation + cache invalidation + consistent toasts.
 * Every write in the app goes through this, so feedback looks and behaves the same everywhere.
 */
export function useApiMutation<TData = unknown, TVars = void>(
  mutationFn: (vars: TVars) => Promise<ApiResponse<TData>>,
  { invalidate, successMessage, errorToast = true, onSuccess }: MutationConfig<ApiResponse<TData>, TVars> = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (res, vars) => {
      await Promise.all((invalidate ?? []).map((queryKey) => qc.invalidateQueries({ queryKey })));
      const msg = typeof successMessage === "function" ? successMessage(res, vars) : successMessage ?? res.message;
      if (msg) toast.success(msg);
      onSuccess?.(res, vars);
    },
    onError: (err) => {
      if (errorToast && getFieldErrors(err).length === 0) toast.error(getErrorMessage(err));
    },
  });
}

type QueryOpts<T> = Omit<UseQueryOptions<T, Error, T, QueryKey>, "queryKey" | "queryFn">;

/** Query-key factory: ["services"], ["services","list",{...}], ["services","detail",5] */
export const createKeys = (scope: string) => ({
  all: [scope] as const,
  lists: () => [scope, "list"] as const,
  list: (params?: ListParams) => [scope, "list", params ?? {}] as const,
  detail: (id: Id) => [scope, "detail", String(id)] as const,
});

/**
 * One call → list/detail queries + create/update/remove mutations for a resource.
 *
 * @example
 * export const serviceHooks = createResourceHooks("services", servicesApi);
 * const { data, isLoading } = serviceHooks.useList(params);
 * const create = serviceHooks.useCreate();
 */
export function createResourceHooks<T, TCreate, TUpdate>(scope: string, resource: Resource<T, TCreate, TUpdate>) {
  const keys = createKeys(scope);
  const invalidate = [keys.all];

  return {
    keys,
    useList: (params?: ListParams, options?: QueryOpts<Paginated<T>>) =>
      useQuery({
        queryKey: keys.list(params),
        queryFn: () => resource.list(params),
        placeholderData: keepPreviousData,
        ...options,
      }),
    useOne: (id: Id | null | undefined, options?: QueryOpts<T>) =>
      useQuery({
        queryKey: keys.detail(id ?? ""),
        queryFn: () => resource.get(id as Id),
        enabled: id !== null && id !== undefined && id !== "",
        ...options,
      }),
    useCreate: (config?: MutationConfig<ApiResponse<T>, TCreate>) =>
      useApiMutation((body: TCreate) => resource.create(body), { invalidate, ...config }),
    useUpdate: (config?: MutationConfig<ApiResponse<T>, { id: Id; data: TUpdate }>) =>
      useApiMutation(({ id, data }: { id: Id; data: TUpdate }) => resource.update(id, data), { invalidate, ...config }),
    useRemove: (config?: MutationConfig<ApiResponse<null>, Id>) =>
      useApiMutation((id: Id) => resource.remove(id), { invalidate, ...config }),
  };
}
