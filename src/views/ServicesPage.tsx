"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Camera, Check, ChevronRight, Clock, Dog, Heart,
  PawPrint, Phone, Scissors, ShieldCheck, Sparkles, Star, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookingModal } from "@/components/BookingModal";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PACKAGES, SERVICES, SERVICE_FAQS } from "@/lib/services";
import { SITE } from "@/lib/site";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" as const } }),
};
const reveal = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" }, variants: fadeUp } as const;

const icons: Record<string, LucideIcon> = {
  "dog-grooming": Scissors,
  "dog-walking": Dog,
  "pet-sitting": Heart,
  "pet-daycare": ShieldCheck,
  "pet-spa": Sparkles,
};

const guarantees = [
  { icon: ShieldCheck, title: "Certified & insured", desc: "Every team member is trained, background-checked and pet first-aid certified." },
  { icon: Sparkles, title: "Pet-safe products", desc: "Gentle, skin-friendly shampoos and conditioners, never harsh chemicals." },
  { icon: Camera, title: "Photo updates", desc: "We send you photos during every visit so you can see the fun." },
  { icon: CalendarDays, title: "Free cancellation", desc: "Change or cancel up to 24 hours before your appointment, no fees." },
];

export default function ServicesPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const openBooking = (svc = "") => { setSelectedService(svc); setBookingOpen(true); };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} preSelectedService={selectedService} />
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
                  From a quick walk to a full luxury spa day, explore everything HappyPaws offers. Transparent prices, gentle hands and easy online booking.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="h-14 px-8 rounded-full text-base gap-2 shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-transform" onClick={() => openBooking()}>
                    <CalendarDays className="w-5 h-5" /> Book appointment
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base gap-2 bg-card/60" asChild>
                    <a href="#packages">See pricing <ArrowRight className="w-4 h-4" /></a>
                  </Button>
                </div>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                  {["5 specialised services", "From $20", "Free cancellation"].map((t) => (
                    <li key={t} className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-secondary" />{t}</li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative max-w-xl mx-auto w-full">
                <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-primary/30 to-secondary/20 blur-2xl -z-10" />
                <div className="relative aspect-[5/4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-foreground/15 ring-1 ring-border">
                  <Image src="/images/hero-grooming.jpg" alt="Golden retriever enjoying a bath with a HappyPaws groomer" fill priority sizes="(max-width: 1024px) 90vw, 520px" className="object-cover object-[65%_50%]" />
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
        <div className="sticky top-[72px] z-40 border-y border-border bg-background/85 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <ul className="flex gap-2 overflow-x-auto py-3 no-scrollbar" aria-label="Jump to a service">
              {SERVICES.map((s) => {
                const Icon = icons[s.slug];
                return (
                  <li key={s.slug} className="shrink-0">
                    <a href={`#${s.slug}`} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-card border border-border hover:border-primary/50 hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />{s.title}
                    </a>
                  </li>
                );
              })}
              <li className="shrink-0"><a href="#packages" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground">Packages</a></li>
            </ul>
          </div>
        </div>

        {/* Detailed services */}
        <section className="py-24">
          <div className="container mx-auto px-4 space-y-24">
            {SERVICES.map((s, idx) => {
              const Icon = icons[s.slug];
              return (
                <motion.article key={s.slug} id={s.slug} {...reveal} custom={0} className="scroll-mt-40 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div className={`relative ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                    <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-secondary/10 blur-xl -z-10" />
                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-foreground/10 ring-1 ring-border group">
                      <Image src={s.image} alt={s.alt} fill sizes="(max-width: 1024px) 92vw, 560px" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
                      <span className="absolute top-5 right-5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">From ${s.price}</span>
                      <span className="absolute bottom-5 left-5 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-background/90 backdrop-blur text-sm font-medium">
                        <Clock className="w-4 h-4 text-primary" />{s.duration}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center"><Icon className="w-7 h-7 text-primary" /></span>
                      <div>
                        <p className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{s.tagline}</p>
                        <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">{s.title}</h2>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">{s.desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 text-sm font-medium">
                          <span className="w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-secondary" /></span>{f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Button size="lg" className="rounded-full h-12 px-7 gap-2 shadow-lg shadow-primary/25" onClick={() => openBooking(s.title)}>
                        <CalendarDays className="w-4 h-4" /> Book {s.title}
                      </Button>
                      <p className="text-sm text-muted-foreground"><span className="text-2xl font-bold text-foreground">${s.price}</span> / session</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0} className="max-w-2xl mx-auto text-center mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Included with every visit</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">The HappyPaws promise</h2>
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

        {/* Packages */}
        <section id="packages" className="py-24 scroll-mt-32">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0} className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Grooming packages</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">Choose your package</h2>
              <p className="text-muted-foreground mt-4 text-lg">Bundled grooming for every coat and budget. Perfect for regular visits.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {PACKAGES.map((p, i) => (
                <motion.div key={p.name} {...reveal} custom={i}
                  className={`relative flex flex-col rounded-3xl p-8 border transition-all duration-300 ${p.popular
                    ? "bg-foreground text-background border-foreground shadow-2xl shadow-primary/20 md:-translate-y-4"
                    : "bg-card border-border hover:shadow-xl hover:-translate-y-1"}`}>
                  {p.popular && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide shadow-lg">MOST POPULAR</span>}
                  <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                  <p className={`text-sm mt-2 ${p.popular ? "text-background/65" : "text-muted-foreground"}`}>{p.desc}</p>
                  <p className="mt-6 mb-7"><span className="font-display text-5xl font-bold">${p.price}</span><span className={`text-sm ${p.popular ? "text-background/60" : "text-muted-foreground"}`}> / session</span></p>
                  <ul className="space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.popular ? "bg-primary" : "bg-secondary/15"}`}><Check className={`w-3 h-3 ${p.popular ? "text-primary-foreground" : "text-secondary"}`} /></span>{f}
                      </li>
                    ))}
                  </ul>
                  <Button size="lg" variant={p.popular ? "default" : "outline"} className="mt-8 rounded-full h-12 gap-2" onClick={() => openBooking(p.name)}>
                    Book {p.name} <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-10">Prices shown are starting rates. Final price depends on your pet&apos;s size and coat and is confirmed before we begin.</p>
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
