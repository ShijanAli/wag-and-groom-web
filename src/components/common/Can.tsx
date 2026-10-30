"use client";

import { useAuth } from "@/context/AuthContext";
import type { PermissionSlug } from "@/lib/permissions";

/**
 * Renders children only when the user has the permission(s).
 * UI hiding only — the backend still enforces every permission.
 *
 * <Can permission={PERMISSIONS.SERVICE.CREATE}><Button>New service</Button></Can>
 * <Can anyOf={[PERMISSIONS.BLOG.CREATE, PERMISSIONS.BLOG.UPDATE]}>…</Can>
 */
export function Can({
  permission,
  anyOf,
  fallback = null,
  children,
}: {
  permission?: PermissionSlug;
  anyOf?: readonly PermissionSlug[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { can, canAny } = useAuth();
  const allowed = (permission ? can(permission) : true) && (anyOf ? canAny(anyOf) : true);
  return <>{allowed ? children : fallback}</>;
}
