"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage, getStatus } from "@/lib/api/errors";
import { refreshAccessToken, tokenStore } from "@/lib/api/client";
import { authApi } from "@/features/auth/api";
import { hasAnyPermission, hasPermission } from "@/lib/auth";
import type { PermissionSlug } from "@/lib/permissions";
import type { AuthUser } from "@/types/models";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  /** Kept for existing components: true until the session restore finished. */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** Re-fetch `/auth/me` (after profile edits, role changes …). */
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  can: (permission: PermissionSlug | string) => boolean;
  canAny: (permissions: readonly (PermissionSlug | string)[]) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Module-level so React StrictMode's double effect run (and multiple tabs of
 * the same render tree) share ONE restore → one refresh call → no token reuse.
 */
let restorePromise: Promise<AuthUser | null> | null = null;

/** Tab refocus re-checks access at most this often (a 403 always re-checks). */
const FOCUS_SYNC_MS = 15_000;

/** Same role and same permission set? (order-insensitive) */
const sameAccess = (a: AuthUser, b: AuthUser) =>
  a.roleId === b.roleId && a.permissions.length === b.permissions.length && a.permissions.every((p) => b.permissions.includes(p));

function restoreSession(): Promise<AuthUser | null> {
  if (!tokenStore.hasSessionHint()) return Promise.resolve(null);
  restorePromise ??= refreshAccessToken()
    .then((token) => (token ? authApi.me() : null))
    .catch(() => null)
    .finally(() => {
      restorePromise = null;
    });
  return restorePromise;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const applyUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    setStatus(u ? "authenticated" : "guest");
  }, []);

  useEffect(() => {
    let active = true;
    restoreSession().then((u) => active && applyUser(u));
    // Refresh token expired / revoked while using the app → drop to guest and wipe cached private data.
    const off = tokenStore.onExpired(() => {
      applyUser(null);
      queryClient.clear();
    });
    return () => {
      active = false;
      off();
    };
  }, [applyUser, queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      tokenStore.set(res.data.accessToken);
      queryClient.clear();
      applyUser(res.data.user);
      return res.data.user;
    },
    [applyUser, queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* server unreachable — still log out locally */
    } finally {
      tokenStore.set(null);
      queryClient.clear();
      applyUser(null);
    }
  }, [applyUser, queryClient]);

  const refreshUser = useCallback(async () => {
    applyUser(await authApi.me());
  }, [applyUser]);

  /*
   * Keep the UI in step with server-side access changes made by an admin while this
   * user is signed in (role changed, permissions edited, account blocked):
   *  - immediately when the API answers 403 "Missing permission" / "account is blocked" …
   *  - when the user comes back to the tab (throttled)
   * The menu, route guard and buttons all read `user.permissions`, so one re-sync updates everything.
   */
  const userRef = useRef(user);
  userRef.current = user;
  const syncing = useRef<Promise<void> | null>(null);
  const lastSync = useRef(0);

  const syncAccess = useCallback(() => {
    const current = userRef.current;
    if (!current) return Promise.resolve();
    syncing.current ??= authApi
      .me()
      .then((fresh) => {
        applyUser(fresh);
        if (!sameAccess(current, fresh)) {
          // private data fetched under the old access may be stale or no longer allowed
          queryClient.invalidateQueries();
          toast.info(fresh.roleId !== current.roleId ? `Your role is now ${fresh.role.name}` : "Your access was updated by an administrator");
        }
      })
      .catch((err) => {
        const code = getStatus(err);
        if (code !== 401 && code !== 403) return; // offline / server error → try again later
        // blocked, deactivated or deleted → end the session here too
        tokenStore.set(null);
        queryClient.clear();
        applyUser(null);
        toast.error(getErrorMessage(err, "Your session has ended"));
      })
      .finally(() => {
        lastSync.current = Date.now();
        syncing.current = null;
      });
    return syncing.current;
  }, [applyUser, queryClient]);

  useEffect(() => tokenStore.onAccessChanged(() => void syncAccess()), [syncAccess]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => {
      if (document.visibilityState === "visible" && Date.now() - lastSync.current > FOCUS_SYNC_MS) void syncAccess();
    };
    lastSync.current = Date.now(); // just signed in / restored → fresh
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [status, syncAccess]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      loading: status === "loading",
      login,
      logout,
      refreshUser,
      setUser: applyUser,
      can: (p) => hasPermission(user, p),
      canAny: (ps) => hasAnyPermission(user, ps),
    }),
    [user, status, login, logout, refreshUser, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
