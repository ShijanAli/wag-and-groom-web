"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/common/NotificationBell";
import { UserMenu } from "@/components/common/UserMenu";
import { MenuSearch } from "./MenuSearch";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <MenuSearch />
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <UserMenu profileHref="/admin/profile" />
      </div>
    </header>
  );
}
