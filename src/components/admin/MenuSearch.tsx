"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

/** Jump-to-page search over the admin menu (only pages the user can open). Press "/" to focus. */
export function MenuSearch() {
  const router = useRouter();
  const { canAny } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowed = useMemo(() => ADMIN_NAV_ITEMS.filter((i) => canAny(i.anyOf)), [canAny]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allowed;
    return allowed.filter((i) => i.title.toLowerCase().includes(q) || i.group.toLowerCase().includes(q) || i.keywords?.some((k) => k.includes(q)));
  }, [allowed, query]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (url: string) => {
    router.push(url);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") (e.preventDefault(), setIndex((i) => Math.min(i + 1, results.length - 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setIndex((i) => Math.max(i - 1, 0)));
    else if (e.key === "Enter" && results[index]) (e.preventDefault(), go(results[index].url));
    else if (e.key === "Escape") (setOpen(false), inputRef.current?.blur());
  };

  return (
    <div ref={boxRef} className="relative hidden md:block">
      <div className="flex w-72 items-center gap-2 rounded-lg bg-muted px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Jump to…"
          aria-label="Search menu"
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border px-1.5 text-[10px] text-muted-foreground">/</kbd>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-xl border bg-popover shadow-lg">
          <div className="max-h-80 overflow-y-auto py-1">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No pages match “{query}”</p>
            ) : (
              results.map((item, i) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => go(item.url)}
                  onMouseEnter={() => setIndex(i)}
                  className={cn("flex w-full items-center gap-3 px-3 py-2.5 text-left", i === index ? "bg-primary/10" : "hover:bg-muted/50")}
                >
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", i === index ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{item.title}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {item.group} <ChevronRight className="h-3 w-3" /> {item.title}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
