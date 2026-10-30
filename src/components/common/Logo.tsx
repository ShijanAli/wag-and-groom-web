import Link from "next/link";
import { PawPrint } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Brand mark used by the site header, auth pages and panel sidebars.
 * `variant="light"` = on a dark/primary background.
 */
export function Logo({
  href = "/",
  collapsed = false,
  variant = "default",
  className,
}: {
  href?: string;
  collapsed?: boolean;
  variant?: "default" | "light" | "sidebar";
  className?: string;
}) {
  const mark = {
    default: "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
    light: "bg-primary-foreground/20 text-primary-foreground backdrop-blur",
    sidebar: "bg-sidebar-primary text-sidebar-primary-foreground",
  }[variant];
  const text = { default: "text-foreground", light: "text-primary-foreground", sidebar: "text-sidebar-foreground" }[variant];

  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)} aria-label={`${SITE.name} home`}>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", mark)}>
        <PawPrint className="h-5 w-5" />
      </span>
      {!collapsed && <span className={cn("font-display text-xl font-bold tracking-tight", text)}>{SITE.name}</span>}
    </Link>
  );
}
