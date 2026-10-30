"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useSubscribe } from "@/features/content/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** One-field signup (footer). Errors are shown inline — no toast spam on a public page. */
export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const subscribe = useSubscribe();

  if (subscribe.isSuccess)
    return (
      <p className={cn("flex items-center gap-2 text-sm text-background/80", className)} role="status">
        <CheckCircle2 className="h-5 w-5 text-success" /> You&apos;re in! Watch your inbox for tips and offers.
      </p>
    );

  return (
    <form
      noValidate
      className={cn("space-y-1.5", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!EMAIL.test(email.trim())) return setError("Enter a valid email address");
        setError(null);
        subscribe.mutate(email.trim(), { onError: (err) => setError(getErrorMessage(err)) });
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex rounded-full bg-background/10 p-1 ring-1 ring-background/15 focus-within:ring-primary">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-background placeholder:text-background/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
        >
          {subscribe.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          <span className="hidden sm:inline">Subscribe</span>
        </button>
      </div>
      {error && (
        <p id="newsletter-error" className="px-4 text-xs text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
