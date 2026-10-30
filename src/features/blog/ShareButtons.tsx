"use client";

import { Check, Facebook, Link2, Linkedin } from "lucide-react";
import { useState } from "react";

/** Share links that don't need any SDK (no tracking scripts on the page). */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { label: "Share on Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "Share on LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "Share on WhatsApp", icon: null, href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
  ];
  const cls = "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:border-primary hover:text-primary";
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm text-muted-foreground">Share</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label} className={cls}>
          {l.icon ? <l.icon className="h-4 w-4" /> : <span className="text-[11px] font-bold">WA</span>}
        </a>
      ))}
      <button
        type="button"
        aria-label="Copy link"
        title="Copy link"
        className={cls}
        onClick={() => navigator.clipboard.writeText(url).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
