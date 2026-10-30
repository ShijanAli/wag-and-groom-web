"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
