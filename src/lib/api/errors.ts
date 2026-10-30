import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiErrorBody, ApiFieldError } from "./types";

const body = (err: unknown): Partial<ApiErrorBody> | undefined =>
  isAxiosError<ApiErrorBody>(err) ? err.response?.data : undefined;

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(err) && !err.response) return "Can't reach the server. Check your connection.";
  return body(err)?.message ?? (err instanceof Error && !isAxiosError(err) ? err.message : fallback);
}

export const getFieldErrors = (err: unknown): ApiFieldError[] => body(err)?.errors ?? [];

export const getStatus = (err: unknown): number | undefined =>
  isAxiosError(err) ? err.response?.status : undefined;

/**
 * Maps backend validation errors (`errors: [{ path: "body.email", message }]`) onto a
 * react-hook-form instance. Returns true when at least one field error was applied.
 */
export function applyFieldErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): boolean {
  const errors = getFieldErrors(err);
  errors.forEach(({ path, message }) => {
    const field = path.replace(/^(body|query|params)\./, "");
    setError(field as Path<T>, { type: "server", message });
  });
  return errors.length > 0;
}
