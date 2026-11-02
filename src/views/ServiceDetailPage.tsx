"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Check, ChevronRight, Clock, PawPrint, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/common/Rating";
import { UserAvatar } from "@/components/common/UserAvatar";
import { SectionHeading } from "@/components/site/Section";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BookingModal } from "@/features/bookings/BookingModal";
import { ServiceCard, fallbackImage } from "@/features/catalog/ServiceCard";
import { GalleryGrid } from "@/features/gallery/components";
import { ServiceReviews } from "@/features/reviews/ServiceReviews";
import { fullName } from "@/lib/auth";
import { formatDuration, formatMoney } from "@/lib/format";
import { cdn } from "@/lib/image";
import type { GalleryItem, PublicSettings, RatingSummary, Service } from "@/types/models";

export interface ServiceDetailProps {
  service: Service;
  summary: RatingSummary | null;
  gallery: GalleryItem[];
  related: Service[];
  settings: PublicSettings | null;
}

export default function ServiceDetailPage({ service: s, summary, gallery, related, settings }: ServiceDetailProps) {
  const [booking, setBooking] = useState<{ open: boolean; serviceId?: number }>({ open: false });
  const book = (serviceId = s.id) => setBooking({ open: true, serviceId });
  const image = s.image ? cdn(s.image, 1200, 900) : fallbackImage(s);
  const saving = s.discountPrice ? Math.round((1 - Number(s.discountPrice) / Number(s.price)) * 100) : 0;
  const rating = summary?.totalReviews ? summary.averageRating : 0;
  const cancelHours = settings?.booking_cancel_before_hours ?? 24;

  const facts = [
    { icon: Clock, label: "Duration", value: formatDuration(s.durationMinutes) },
    { icon: PawPrint, label: "For", value: s.petTypes.map((t) => t.name).join(", ") || "All pets" },
    { icon: Users, label: "Pets per booking", value: `Up to ${s.maxPetsPerBooking}` },
    { icon: ShieldCheck, label: "Vaccination", value: s.requiresVaccination ? "Required" : "Not required" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BookingModal open={booking.open} onOpenChange={(open) => setBooking((b) => ({ ...b, open }))} serviceId={booking.serviceId} />
      <SiteHeader onBook={() => book()} />

      <main className="pt-[72px]">
        <section className="bg-gradient-to-b from-accent/60 to-background">
          <div className="container mx-auto px-4 pb-16 pt-8">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/services" className="hover:text-primary">
                Services
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground" aria-current="page">
                {s.name}
              </span>
            </nav>

            <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent to-primary/15 shadow-xl ring-1 ring-border">
                {image ? (
                  s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- API image via CDN helper
                    <img src={image} alt={s.name} className="h-full w-full object-cover" />
                  ) : (
                    <Image src={image} alt={s.name} fill priority sizes="(max-width: 1024px) 92vw, 640px" className="object-cover" />
                  )
                ) : (
                  <Sparkles className="absolute inset-0 m-auto h-16 w-16 text-primary/40" />
                )}
                {saving > 0 && <span className="absolute right-5 top-5 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow">Save {saving}%</span>}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Link href={`/services#${s.category.slug}`} className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    {s.category.name}
                  </Link>
                  <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">{s.name}</h1>
                  {rating > 0 && (
                    <a href="#reviews" className="inline-flex items-center gap-2 text-sm">
                      <Stars value={rating} /> <strong>{rating.toFixed(1)}</strong>
                      <span className="text-muted-foreground underline-offset-2 hover:underline">
                        {summary!.totalReviews} review{summary!.totalReviews === 1 ? "" : "s"}
                      </span>
                    </a>
                  )}
                  {s.shortDescription && <p className="text-lg leading-relaxed text-muted-foreground">{s.shortDescription}</p>}
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  {facts.map((f) => (
                    <div key={f.label} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
                      <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <dt className="text-xs text-muted-foreground">{f.label}</dt>
                        <dd className="text-sm font-semibold">{f.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-bold">{formatMoney(s.discountPrice ?? s.price)}</span>
                      {s.discountPrice && <span className="text-muted-foreground line-through">{formatMoney(s.price)}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Free cancellation up to {cancelHours}h before</p>
                  </div>
                  <Button size="lg" className="h-14 gap-2 rounded-full px-8 text-base shadow-lg shadow-primary/30" onClick={() => book()}>
                    <CalendarDays className="h-5 w-5" /> Book this service
                  </Button>
                </div>

                {s.staff && s.staff.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {s.staff.slice(0, 5).map((p) => (
                        <UserAvatar key={p.id} user={p} className="h-9 w-9 border-2 border-background" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Done by {s.staff.slice(0, 2).map(fullName).join(", ")}
                      {s.staff.length > 2 && ` and ${s.staff.length - 2} more`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {s.description && (
          <section className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-5 font-display text-3xl font-bold">What&apos;s included</h2>
              <div className="space-y-3 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{s.description}</div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {["Certified, gentle handlers", "Pet-safe, skin-friendly products", "Updates during the visit", "Pay at the counter"].map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-success" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="bg-muted/50 py-16">
            <div className="container mx-auto px-4">
              <SectionHeading align="left" eyebrow="Results" title={`${s.name} in pictures`} className="mb-8" />
              <GalleryGrid items={gallery} />
            </div>
          </section>
        )}

        <section id="reviews" className="container mx-auto scroll-mt-24 px-4 py-16">
          <SectionHeading align="left" eyebrow="Reviews" title="What pet parents say" className="mb-8" />
          <ServiceReviews serviceSlug={s.slug} summary={summary} />
        </section>

        {related.length > 0 && (
          <section className="bg-muted/50 py-16">
            <div className="container mx-auto px-4">
              <SectionHeading align="left" eyebrow="You may also like" title={`More ${s.category.name.toLowerCase()} services`} className="mb-8" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <ServiceCard key={r.id} service={r} onBook={() => book(r.id)} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="font-display text-xl font-bold">{formatMoney(s.discountPrice ?? s.price)}</p>
        <Button className="gap-2 rounded-full" onClick={() => book()}>
          <CalendarDays className="h-4 w-4" /> Book now
        </Button>
      </div>
      <div className="pb-16 lg:pb-0">
        <SiteFooter />
      </div>
    </div>
  );
}
