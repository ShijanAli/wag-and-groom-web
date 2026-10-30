"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { NotificationBell } from "@/components/common/NotificationBell";
import { UserMenu } from "@/components/common/UserMenu";
import { cn } from "@/lib/utils";

/** Top bar for the customer and staff panels (the admin panel has a sidebar instead). */
export function PanelHeader({
  home,
  badge,
  links = [],
  actions,
  profileHref,
}: {
  home: string;
  badge?: string;
  links?: { label: string; href: string }[];
  actions?: React.ReactNode;
  profileHref?: string;
}) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <Logo href={home} />
          {badge && <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:inline">{badge}</span>}
        </div>
        {links.length > 0 && (
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === l.href ? "text-foreground" : "text-muted-foreground")}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-1">
          {actions}
          <NotificationBell />
          <UserMenu profileHref={profileHref} />
        </div>
      </div>
    </header>
  );
}
