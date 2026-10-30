"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV, findNavItem } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const pathname = usePathname();
  const { canAny } = useAuth();
  const activeUrl = findNavItem(pathname)?.url;

  // Only groups/items the user may open — empty groups disappear entirely.
  const groups = useMemo(
    () => ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => canAny(i.anyOf)) })).filter((g) => g.items.length > 0),
    [canAny],
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-3">
        <Logo href="/admin" variant="sidebar" collapsed={collapsed} />
      </div>

      <SidebarContent className="pt-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/50">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = item.url === activeUrl;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link
                          href={item.url}
                          onClick={() => isMobile && setOpenMobile(false)}
                          className={cn("hover:bg-sidebar-accent", active && "bg-sidebar-accent font-medium text-sidebar-primary")}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
