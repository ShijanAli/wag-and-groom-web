import { http } from "./client";
import type { ApiResponse, Id, ListParams, Paginated } from "./types";

/** Drops empty values so `?status=&searchTerm=` never reaches the API. */
export function cleanParams(params?: ListParams): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === "all") continue;
    out[k] = v;
  }
  return out;
}

/* Thin, typed wrappers — every call returns the backend envelope or its `data`. */

export const api = {
  async get<T>(url: string, params?: ListParams): Promise<T> {
    const res = await http.get<ApiResponse<T>>(url, { params: cleanParams(params) });
    return res.data.data;
  },
  async list<T>(url: string, params?: ListParams): Promise<Paginated<T>> {
    const res = await http.get<ApiResponse<T[]>>(url, { params: cleanParams(params) });
    const { data, meta } = res.data;
    return { data, meta: meta ?? { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
  },
  async post<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return (await http.post<ApiResponse<T>>(url, body)).data;
  },
  async patch<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return (await http.patch<ApiResponse<T>>(url, body)).data;
  },
  async put<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return (await http.put<ApiResponse<T>>(url, body)).data;
  },
  async delete<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return (await http.delete<ApiResponse<T>>(url, { data: body })).data;
  },
  async upload<T>(url: string, form: FormData, params?: ListParams): Promise<ApiResponse<T>> {
    return (await http.post<ApiResponse<T>>(url, form, { params: cleanParams(params) })).data;
  },
};

/**
 * REST resource for the standard backend CRUD routes:
 * GET /x · GET /x/:id · POST /x · PATCH /x/:id · DELETE /x/:id
 */
export function createResource<T, TCreate = Partial<T>, TUpdate = Partial<TCreate>>(path: string) {
  return {
    path,
    list: (params?: ListParams) => api.list<T>(path, params),
    get: (id: Id) => api.get<T>(`${path}/${id}`),
    create: (body: TCreate) => api.post<T>(path, body),
    update: (id: Id, body: TUpdate) => api.patch<T>(`${path}/${id}`, body),
    remove: (id: Id) => api.delete<null>(`${path}/${id}`),
  };
}

export type Resource<T, TCreate = Partial<T>, TUpdate = Partial<TCreate>> = ReturnType<
  typeof createResource<T, TCreate, TUpdate>
>;
