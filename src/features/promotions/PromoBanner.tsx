"use client";

import { useState } from "react";
import { Check, Copy, Sparkles, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Promotion } from "@/types/models";
import { discountLabel } from "./api";

export type ActivePromotion = Pick<Promotion, "id" | "title" | "code" | "description" | "discountType" | "discountValue" | "maxDiscountAmount" | "endsAt">;

/** Thin strip under the header with the best running promo code (copy-to-clipboard, dismissible per visit). */
export function PromoBanner({ promotion: p }: { promotion: ActivePromotion }) {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  if (hidden || !p.code) return null;
  return (
    <div className="relative z-10 bg-foreground text-background">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-10 py-2 text-center text-sm">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <span>
          <strong>{p.title}</strong> — {discountLabel(p)} with code
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(p.code!).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}
          className="inline-flex items-center gap-1 rounded border border-dashed border-primary px-2 py-0.5 font-mono text-xs font-bold text-primary hover:bg-primary/10"
          aria-label={`Copy code ${p.code}`}
        >
          {p.code} {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
        <span className="text-background/60">until {formatDate(p.endsAt, "d MMM")}</span>
        <button type="button" onClick={() => setHidden(true)} aria-label="Hide offer" className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-background/60 hover:text-background">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
