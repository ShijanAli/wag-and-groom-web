"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, LayoutDashboard, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { fullName, homePathFor } from "@/lib/auth";
import { UserAvatar } from "./UserAvatar";

/** Avatar dropdown used in every panel header and the public site header. */
export function UserMenu({ profileHref, showDashboardLink = false }: { profileHref?: string; showDashboardLink?: boolean }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;

  const signOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full px-1.5 sm:pr-3" aria-label="Account menu">
          <UserAvatar user={user} />
          <span className="hidden max-w-[140px] truncate text-sm font-medium sm:inline">{user.firstName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{fullName(user)}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {user.role.name}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showDashboardLink && (
          <DropdownMenuItem asChild>
            <Link href={homePathFor(user)}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> My dashboard
            </Link>
          </DropdownMenuItem>
        )}
        {profileHref && (
          <DropdownMenuItem asChild>
            <Link href={profileHref}>
              <User className="mr-2 h-4 w-4" /> Profile & password
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Visit website
          </Link>
        </DropdownMenuItem>
        <ThemeItem />
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <DropdownMenuItem onSelect={(e) => (e.preventDefault(), setTheme(dark ? "light" : "dark"))}>
      {dark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
      {dark ? "Light mode" : "Dark mode"}
    </DropdownMenuItem>
  );
}
