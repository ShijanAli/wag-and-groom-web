"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { homePathFor } from "@/lib/auth";
import { Logo } from "@/components/common/Logo";
import { UserMenu } from "@/components/common/UserMenu";
import { Button } from "@/components/ui/button";

interface Props {
  onBook: () => void;
}

export function SiteHeader({ onBook }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On the home page section links are in-page anchors; elsewhere they point back to "/".
  const prefix = pathname === "/" ? "" : "/";
  const navLinks = [
    { label: "Home", href: "/", active: pathname === "/" },
    { label: "Services", href: "/services", active: pathname.startsWith("/services") },
    { label: "Adopt", href: "/adopt", active: pathname.startsWith("/adopt") },
    { label: "Gallery", href: "/gallery", active: pathname.startsWith("/gallery") },
    { label: "Blog", href: "/blog", active: pathname.startsWith("/blog") },
    { label: "FAQ", href: `${prefix}#faq` },
    { label: "Contact", href: `${prefix}#contact` },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const book = () => {
    setMenuOpen(false);
    onBook();
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"}`}>
      <nav aria-label="Main" className="container mx-auto flex items-center justify-between h-[72px] px-4">
        <Logo />
        <ul className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} aria-current={l.active ? "page" : undefined} className={`text-sm font-medium transition-colors hover:text-primary ${l.active ? "text-primary" : "text-muted-foreground"}`}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><AuthNavActions onBook={book} /></div>
          <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className={`px-3 py-3 rounded-xl text-sm font-medium hover:bg-accent ${l.active ? "text-primary bg-accent/60" : ""}`}>{l.label}</Link>
            ))}
            <div className="pt-3 sm:hidden"><AuthNavActions onBook={book} /></div>
          </div>
        </div>
      )}
    </header>
  );
}

function AuthNavActions({ onBook }: { onBook: () => void }) {
  const { user, status } = useAuth();
  // Avoid a "Sign in" → avatar flash while the session restores
  if (status === "loading") return <div className="h-9 w-40" aria-hidden />;
  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" className="rounded-full" asChild>
          <Link href={homePathFor(user)}>
            <LayoutDashboard className="mr-1.5 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button size="sm" className="rounded-full px-5" onClick={onBook}>
          Book now
        </Button>
        <UserMenu />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" className="rounded-full" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button variant="outline" size="sm" className="rounded-full bg-card/60" asChild>
        <Link href="/register">Sign up</Link>
      </Button>
      <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/30" onClick={onBook}>
        Book now
      </Button>
    </div>
  );
}
