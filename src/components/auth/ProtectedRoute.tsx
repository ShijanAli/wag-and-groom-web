"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, UserRole, roleHomePath } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const forbidden = !!user && !!allowedRoles && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    else if (forbidden) router.replace(roleHomePath[user.role]);
  }, [loading, user, forbidden, pathname, router]);

  if (loading || !user || forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}
