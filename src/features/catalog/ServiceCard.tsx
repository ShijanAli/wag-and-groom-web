"use client";

import Image from "next/image";
import { CalendarDays, Clock, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatMoney } from "@/lib/format";
import type { Service } from "@/types/models";

/** Local fallback photos so a service without an uploaded image still looks good. */
const FALLBACKS: [RegExp, string][] = [
  [/groom|bath|nail|brush|haircut/i, "/images/service-grooming.jpg"],
  [/walk|exercise|run/i, "/images/service-walking.jpg"],
  [/sit|board|stay/i, "/images/service-sitting.jpg"],
  [/daycare|play/i, "/images/service-daycare.jpg"],
  [/spa|massage|aroma|wellness/i, "/images/service-spa.jpg"],
];
const fallbackImage = (s: Service) => FALLBACKS.find(([re]) => re.test(`${s.name} ${s.category.name}`))?.[1];

export function ServiceCard({ service: s, onBook }: { service: Service; index?: number; onBook: () => void }) {
  const image = s.image ?? fallbackImage(s);
  const saving = s.discountPrice ? Math.round((1 - Number(s.discountPrice) / Number(s.price)) * 100) : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-accent to-primary/15">
        {image ? (
          <Image src={image} alt={s.name} fill sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        {s.isFeatured && <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">⭐ Popular</span>}
        {saving > 0 && <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow">Save {saving}%</span>}
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
          <Clock className="h-3.5 w-3.5 text-primary" /> {formatDuration(s.durationMinutes)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold leading-snug">{s.name}</h3>
          {s.reviewsCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium" aria-label={`Rated ${s.avgRating} out of 5`}>
              <Star className="h-4 w-4 fill-warning text-warning" /> {s.avgRating}
              <span className="text-xs font-normal text-muted-foreground">({s.reviewsCount})</span>
            </span>
          )}
        </div>
        {s.shortDescription && <p className="text-sm leading-relaxed text-muted-foreground">{s.shortDescription}</p>}
        <div className="flex flex-wrap gap-1.5">
          {s.petTypes.map((t) => (
            <span key={t.id} className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
              {t.name}
            </span>
          ))}
          {s.requiresVaccination && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Vaccination needed
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <p>
            <span className="font-display text-2xl font-bold">{formatMoney(s.discountPrice ?? s.price)}</span>
            {s.discountPrice && <span className="ml-2 text-sm text-muted-foreground line-through">{formatMoney(s.price)}</span>}
          </p>
          <Button className="gap-2 rounded-full" onClick={onBook} aria-label={`Book ${s.name}`}>
            <CalendarDays className="h-4 w-4" /> Book
          </Button>
        </div>
      </div>
    </article>
  );
}
