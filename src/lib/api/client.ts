/**
 * Axios client for the PetPlex API.
 *
 * - Access token lives in memory only (never in localStorage).
 * - Refresh token is the httpOnly cookie set by the backend — JS never sees it.
 * - On 401 → ONE refresh call (single-flight), then the failed request is retried once.
 * - A tiny localStorage flag remembers "this browser had a session", so guests
 *   never fire a pointless refresh request on every page load.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const SESSION_HINT_KEY = "petplex.has-session";

const hint = {
  get: () => typeof window !== "undefined" && window.localStorage.getItem(SESSION_HINT_KEY) === "1",
  set: (on: boolean) => {
    if (typeof window === "undefined") return;
    if (on) window.localStorage.setItem(SESSION_HINT_KEY, "1");
    else window.localStorage.removeItem(SESSION_HINT_KEY);
  },
};

/* ─────────────────────────── token store ─────────────────────────── */

let accessToken: string | null = null;
const expiredListeners = new Set<() => void>();

export const tokenStore = {
  get: () => accessToken,
  set(token: string | null) {
    accessToken = token;
    hint.set(Boolean(token));
  },
  hasSessionHint: hint.get,
  /** Called when the refresh token is gone (expired / revoked / logged out elsewhere). */
  onExpired(fn: () => void) {
    expiredListeners.add(fn);
    return () => void expiredListeners.delete(fn);
  },
};

/* ─────────────────────────── axios instances ─────────────────────────── */

export const http = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 30_000 });

/** Separate instance so refresh/logout never pass through the 401 interceptor (no loops). */
const authHttp = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 30_000 });

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

/* ─────────────────────────── single-flight refresh ─────────────────────────── */

let refreshPromise: Promise<string | null> | null = null;

/**
 * The backend rotates the refresh token on every call and treats re-use of an
 * old one as theft, so parallel refreshes MUST share one request.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= authHttp
    .post<ApiResponse<{ accessToken: string }>>("/auth/refresh-token")
    .then((res) => {
      tokenStore.set(res.data.data.accessToken);
      return res.data.data.accessToken;
    })
    .catch(() => {
      tokenStore.set(null);
      expiredListeners.forEach((fn) => fn());
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const NO_REFRESH_ROUTES = ["/auth/login", "/auth/register", "/auth/refresh-token", "/auth/logout"];

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const skip = !original || original._retried || NO_REFRESH_ROUTES.some((p) => original.url?.startsWith(p));
    if (error.response?.status !== 401 || skip) return Promise.reject(error);

    original._retried = true;
    const token = await refreshAccessToken();
    if (!token) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${token}`;
    return http(original);
  },
);

export const authClient = authHttp;
