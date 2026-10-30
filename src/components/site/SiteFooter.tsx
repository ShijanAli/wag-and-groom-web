"use client";

import Link from "next/link";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SITE } from "@/lib/site";
import { useContactInfo } from "@/features/settings/api";
import { NewsletterForm } from "./NewsletterForm";

const columns: { title: string; links: [string, string][] }[] = [
  { title: "Explore", links: [["Services & prices", "/services"], ["Adopt a pet", "/adopt"], ["Gallery", "/gallery"], ["Blog", "/blog"]] },
  { title: "Help", links: [["FAQ", "/#faq"], ["Contact us", "/#contact"], ["My account", "/dashboard"], ["Create account", "/register"]] },
];

export function SiteFooter() {
  const c = useContactInfo();
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 pb-8 pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.4fr]">
          <div className="space-y-4">
            <Logo className="[&_span:last-child]:text-background" />
            <p className="max-w-xs text-sm leading-relaxed text-background/60">Grooming, spa, walking, sitting and adoption — gentle care for dogs and cats, booked online in a minute.</p>
            <address className="space-y-2 text-sm not-italic text-background/70">
              <a href={`tel:${c.phoneHref}`} className="flex items-center gap-2 hover:text-primary">
                <Phone className="h-4 w-4" /> {c.phone}
              </a>
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:text-primary">
                <Mail className="h-4 w-4" /> {c.email}
              </a>
              <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                <MapPin className="h-4 w-4" /> {c.address}
              </a>
            </address>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-4 font-semibold">{col.title}</h3>
              <ul className="space-y-2.5 text-sm text-background/60">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="space-y-4">
            <h3 className="font-semibold">Pet tips in your inbox</h3>
            <p className="text-sm text-background/60">Grooming advice, new pets up for adoption and members-only offers. No spam — unsubscribe any time.</p>
            <NewsletterForm />
            {c.socials.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1" aria-label="Social media">
                {c.socials.map((s) => (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-background/10 px-3 py-1 text-xs font-medium transition hover:bg-primary hover:text-primary-foreground">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-background/10 pt-6 text-sm text-background/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> for pets everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
