"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, "className"> {
  className?: string;
  activeClassName?: string;
  end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, end, href, ...props }, ref) => {
    const pathname = usePathname();
    const target = typeof href === "string" ? href : href.pathname ?? "";
    const isActive = end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
    return <Link ref={ref} href={href} className={cn(className, isActive && activeClassName)} {...props} />;
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
