/** Shapes shared by every backend response (see backend `sendResponse`). */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: PaginationMeta;
  data: T;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiFieldError[];
}

export type SortOrder = "asc" | "desc";

/** Query params accepted by every list endpoint (`listQuerySchema` in the backend). */
export interface ListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  [filter: string]: string | number | boolean | undefined | null;
}

export type Id = number | string;
