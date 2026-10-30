"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { homePathFor, isCustomer, isStaff, postLoginPath } from "@/lib/auth";
import type { AuthUser } from "@/types/models";
import { FullPageLoader } from "@/components/common/FullPageLoader";

/** Which panel a route belongs to. Admin = any role that is neither customer nor staff. */
export type Area = "customer" | "staff" | "admin";

const inArea: Record<Area, (u: AuthUser) => boolean> = {
  customer: isCustomer,
  staff: isStaff,
  admin: (u) => !isCustomer(u) && !isStaff(u),
};

/**
 * Client-side guard. The refresh cookie belongs to the API domain, so Next
 * middleware can't see the session — protection here is UX; the API enforces access.
 */
export function ProtectedRoute({ area, children }: { area?: Area; children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const wrongArea = !!user && !!area && !inArea[area](user);

  useEffect(() => {
    if (status === "loading") return;
    if (!user) router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    else if (wrongArea) router.replace(homePathFor(user));
  }, [status, user, wrongArea, pathname, router]);

  if (status === "loading" || !user || wrongArea) return <FullPageLoader />;
  return <>{children}</>;
}

/**
 * For /login, /register …: a signed-in user goes to `?from` (if it's theirs) or their panel.
 * This is also what moves the user on right after a successful login — one redirect rule, no race.
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const from = useSearchParams().get("from");

  useEffect(() => {
    if (user) router.replace(postLoginPath(user, from));
  }, [user, from, router]);

  if (status === "loading" || user) return <FullPageLoader />;
  return <>{children}</>;
}
