"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarDays, Camera, ChevronRight, Clock, PawPrint, Phone, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookingModal } from "@/features/bookings/BookingModal";
import { ServiceCard } from "@/features/catalog/ServiceCard";
import { EmptyState } from "@/components/common/EmptyState";
import { formatMoney } from "@/lib/format";
import type { PublicSettings, Service, ServiceCategory } from "@/types/models";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SERVICE_FAQS } from "@/lib/services";
import { SITE } from "@/lib/site";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" as const } }),
};
const reveal = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" }, variants: fadeUp } as const;

const guarantees = [
  { icon: ShieldCheck, title: "Certified & insured", desc: "Every team member is trained, background-checked and pet first-aid certified." },
  { icon: Sparkles, title: "Pet-safe products", desc: "Gentle, skin-friendly shampoos and conditioners, never harsh chemicals." },
  { icon: Camera, title: "Photo updates", desc: "We send you photos during every visit so you can see the fun." },
  { icon: CalendarDays, title: "Free cancellation", desc: "Cancel from your dashboard before the cut-off — no fees." },
];

export interface ServicesPageProps {
  services: Service[];
  categories: ServiceCategory[];
  settings: PublicSettings | null;
}

/** Group services under their top-level category (sub-category services roll up to the parent). */
function groupByRoot(services: Service[], categories: ServiceCategory[]) {
  const rootOf = new Map<number, ServiceCategory>();
  categories.forEach((root) => {
    rootOf.set(root.id, root);
    root.children?.forEach((c) => rootOf.set(c.id, root));
  });
  return categories
    .map((root) => ({ category: root, services: services.filter((s) => rootOf.get(s.categoryId)?.id === root.id) }))
    .filter((g) => g.services.length > 0);
}

export default function ServicesPage({ services, categories, settings }: ServicesPageProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<number | undefined>();
  const openBooking = (serviceId?: number) => {
    setSelectedService(serviceId);
    setBookingOpen(true);
  };
  const groups = groupByRoot(services, categories);
  const minPrice = services.length ? Math.min(...services.map((s) => Number(s.discountPrice ?? s.price))) : null;
  const highlights = [
    `${services.length} services`,
    minPrice !== null ? `From ${formatMoney(minPrice)}` : null,
    `Free cancellation up to ${settings?.booking_cancel_before_hours ?? 24}h`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} serviceId={selectedService} />
      <SiteHeader onBook={() => openBooking()} />

      <main>
        {/* Hero */}
        <section className="relative pt-[72px] overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/70 via-background to-background" />
          <div className="absolute -top-24 -left-24 -z-10 w-[420px] h-[420px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/3 -right-24 -z-10 w-[360px] h-[360px] rounded-full bg-secondary/15 blur-3xl" />

          <div className="container mx-auto px-4 pt-10 pb-16 lg:pt-16 lg:pb-24">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li aria-hidden><ChevronRight className="w-4 h-4" /></li>
                <li aria-current="page" className="text-foreground font-medium">Services</li>
              </ol>
            </nav>
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-6">
                <span className="inline-flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-card border border-border shadow-sm text-sm font-medium">
                  <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center"><PawPrint className="w-3.5 h-3.5 text-primary" /></span>
                  Our services &amp; pricing
                </span>
                <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
                  Premium care for <span className="text-primary">every pet</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  From a quick walk to a full luxury spa day, explore everything PetPlex offers. Transparent prices, gentle hands and easy online booking.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="h-14 px-8 rounded-full text-base gap-2 shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-transform" onClick={() => openBooking()}>
                    <CalendarDays className="w-5 h-5" /> Book appointment
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base gap-2 bg-card/60" asChild>
                    <a href="#catalog">See prices <ArrowRight className="w-4 h-4" /></a>
                  </Button>
                </div>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                  {highlights.map((t) => (
                    <li key={t} className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-secondary" />{t}</li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative max-w-xl mx-auto w-full">
                <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-primary/30 to-secondary/20 blur-2xl -z-10" />
                <div className="relative aspect-[5/4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-foreground/15 ring-1 ring-border">
                  <Image src="/images/hero-grooming.jpg" alt="Golden retriever enjoying a bath with a PetPlex groomer" fill priority sizes="(max-width: 1024px) 90vw, 520px" className="object-cover object-[65%_50%]" />
                </div>
                <div className="absolute -bottom-6 -left-4 sm:-left-8 w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-background shadow-xl">
                  <Image src="/images/service-spa.jpg" alt="Relaxed cat after a spa treatment" fill sizes="180px" className="object-cover" />
                </div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-4 -right-2 sm:-right-6 bg-card rounded-2xl shadow-xl border border-border p-3.5 pr-5 flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center"><Star className="w-5 h-5 fill-primary text-primary" /></span>
                  <div><p className="text-sm font-semibold leading-tight">4.9 rating</p><p className="text-xs text-muted-foreground">2,500+ happy pets</p></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick jump */}
        {groups.length > 1 && (
          <div className="sticky top-[72px] z-40 border-y border-border bg-background/85 backdrop-blur-xl">
            <div className="container mx-auto px-4">
              <ul className="flex gap-2 overflow-x-auto py-3 no-scrollbar" aria-label="Jump to a category">
                {groups.map(({ category }) => (
                  <li key={category.id} className="shrink-0">
                    <a href={`#${category.slug}`} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-card border border-border hover:border-primary/50 hover:text-primary transition-colors">
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Catalog (from the API) */}
        <section id="catalog" className="py-20 scroll-mt-32">
          <div className="container mx-auto px-4 space-y-20">
            {groups.length === 0 ? (
              <EmptyState icon={Sparkles} title="Our service menu is being updated" description="Please check back soon, or call us to book." className="bg-card" />
            ) : (
              groups.map(({ category, services: list }) => (
                <motion.section key={category.id} id={category.slug} {...reveal} custom={0} className="scroll-mt-40 space-y-8" aria-labelledby={`cat-${category.id}`}>
                  <div className="max-w-2xl space-y-2">
                    <h2 id={`cat-${category.id}`} className="font-display text-3xl md:text-4xl font-bold leading-tight">{category.name}</h2>
                    {category.description && <p className="text-muted-foreground text-lg">{category.description}</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.map((s, i) => (
                      <ServiceCard key={s.id} service={s} index={i} onBook={() => openBooking(s.id)} />
                    ))}
                  </div>
                </motion.section>
              ))
            )}
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0} className="max-w-2xl mx-auto text-center mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Included with every visit</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">The PetPlex promise</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {guarantees.map((g, i) => (
                <motion.div key={g.title} {...reveal} custom={i} className="bg-card rounded-3xl p-7 border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <span className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-5"><g.icon className="w-6 h-6 text-primary" /></span>
                  <h3 className="font-display text-lg font-semibold">{g.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{g.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-muted/50 scroll-mt-16">
          <div className="container mx-auto px-4 grid lg:grid-cols-[1fr_1.4fr] gap-14">
            <motion.div {...reveal} custom={0} className="lg:sticky lg:top-40 self-start space-y-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Service FAQ</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Good to know before you book</h2>
              <p className="text-muted-foreground text-lg">Still unsure which service suits your pet? Our team is happy to recommend one.</p>
              <Button variant="outline" className="rounded-full gap-2 bg-card" asChild><Link href="/#contact">Ask our team <ArrowRight className="w-4 h-4" /></Link></Button>
            </motion.div>
            <motion.div {...reveal} custom={1}>
              <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
                {SERVICE_FAQS.map((f, i) => (
                  <AccordionItem key={f.q} value={`item-${i}`} className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-lg data-[state=open]:border-primary/40 transition-all">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-24">
          <motion.div {...reveal} custom={0} className="container mx-auto relative rounded-[2.5rem] overflow-hidden min-h-[340px] flex items-center">
            <Image src="/images/gallery-puppy.jpg" alt="" aria-hidden fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/20" />
            <div className="relative p-8 md:p-16 max-w-2xl text-background space-y-5">
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Ready to pamper your pet?</h2>
              <p className="text-background/80 text-lg">Book your first appointment today and give your furry friend the care they deserve.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="rounded-full h-14 px-8 gap-2 shadow-xl shadow-primary/30" onClick={() => openBooking()}><CalendarDays className="w-5 h-5" /> Book now</Button>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 gap-2 bg-transparent text-background border-background/40 hover:bg-background hover:text-foreground" asChild>
                  <a href={`tel:${SITE.phoneHref}`}><Phone className="w-4 h-4" /> {SITE.phone}</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
