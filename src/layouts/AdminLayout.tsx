"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { findNavItem } from "@/lib/admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 bg-muted/30 p-4 sm:p-6">
            {/* list pages read URL params (useSearchParams) → must sit under Suspense */}
            <Suspense fallback={null}>
              <RoutePermission>{children}</RoutePermission>
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/** Permission per admin route comes from ADMIN_NAV — no page repeats its own check. */
function RoutePermission({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { canAny } = useAuth();
  const item = findNavItem(pathname);
  if (item && !canAny(item.anyOf)) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="You don't have access to this page"
        description="Ask an administrator to grant your role the required permission."
        className="mx-auto mt-10 max-w-lg bg-card"
      />
    );
  }
  return <>{children}</>;
}
