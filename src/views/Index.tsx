"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarCheck, CalendarDays, Clock, Heart, HeartHandshake, Mail, MapPin, PawPrint, Phone, Quote, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/common/Rating";
import { UserAvatar } from "@/components/common/UserAvatar";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { SectionHeading } from "@/components/site/Section";
import { BookingModal } from "@/features/bookings/BookingModal";
import { ServiceCard } from "@/features/catalog/ServiceCard";
import { AdoptionPetCard } from "@/features/adoption/components";
import { BlogCard } from "@/features/blog/components";
import { ContactForm } from "@/features/content/ContactForm";
import { GalleryGrid } from "@/features/gallery/components";
import { useContactInfo } from "@/features/settings/api";
import { PromoBanner, type ActivePromotion } from "@/features/promotions/PromoBanner";
import type { AdoptionPet, BlogPost, Faq, GalleryItem, PublicSettings, Service, Testimonial } from "@/types/models";

export interface HomeStats {
  services: number;
  reviews: number;
  avgRating: number;
  adoptablePets: number;
}

export interface HomeData {
  services: Service[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  faqs: Faq[];
  posts: BlogPost[];
  pets: AdoptionPet[];
  settings: PublicSettings | null;
  stats: HomeStats;
  promotion: ActivePromotion | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" as const } }),
};
const reveal = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" }, variants: fadeUp } as const;

const steps = [
  { icon: CalendarCheck, title: "Book online", desc: "Pick a service, your pet and a free time slot. Takes about a minute." },
  { icon: PawPrint, title: "Bring your pet", desc: "Drop off at our studio — we'll keep you posted while we pamper them." },
  { icon: Heart, title: "Enjoy the results", desc: "Pick up a happy, fresh pet. Pay online with bKash, Nagad or card, or at the counter." },
];

const perks = ["Certified, gentle groomers", "Pet first-aid trained team", "Premium, skin-friendly products", "Rescue pets looking for a home"];

const avatar = (name: string, image: string | null) => ({ firstName: name.split(" ")[0], lastName: name.split(" ").slice(1).join(" "), profilePhoto: image });

export default function Index({ services, gallery, testimonials, faqs, posts, pets, settings, stats, promotion }: HomeData) {
  const [booking, setBooking] = useState<{ open: boolean; serviceId?: number }>({ open: false });
  const openBooking = (serviceId?: number) => setBooking({ open: true, serviceId });
  const contact = useContactInfo(settings);
  const cancelHours = settings?.booking_cancel_before_hours ?? 24;

  const trust = [
    stats.services > 0 && [`${stats.services}`, "Pet care services"],
    stats.reviews > 0 && [`${stats.avgRating.toFixed(1)}/5`, `From ${stats.reviews.toLocaleString("en-IN")} reviews`],
    stats.adoptablePets > 0 && [`${stats.adoptablePets}`, "Pets waiting for a home"],
    [`${cancelHours}h`, "Free cancellation window"],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <BookingModal open={booking.open} onOpenChange={(open) => setBooking((b) => ({ ...b, open }))} serviceId={booking.serviceId} />
      <SiteHeader onBook={() => openBooking()} />

      <main>
        {/* Hero */}
        <section className="relative pt-[72px]">
          {promotion && <PromoBanner promotion={promotion} />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/70 via-background to-background" />
          <div className="absolute -right-24 -top-24 -z-10 h-[480px] w-[480px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -left-32 top-1/2 -z-10 h-[360px] w-[360px] rounded-full bg-secondary/15 blur-3xl" />

          <div className="container mx-auto grid items-center gap-14 px-4 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-4 text-sm font-medium shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </span>
                Grooming · Spa · Adoption — all in one place
              </span>
              <h1 className="font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
                Where every pet leaves{" "}
                <span className="relative inline-block text-primary">
                  wagging
                  <svg aria-hidden className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8 C 50 2, 150 2, 198 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".35" />
                  </svg>
                </span>
                .
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Professional grooming, spa, walking and sitting from certified pet lovers — and rescue pets looking for a forever home. Book in under a minute.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-14 gap-2 rounded-full px-8 text-base shadow-xl shadow-primary/30 transition-transform hover:-translate-y-0.5" onClick={() => openBooking()}>
                  <CalendarDays className="h-5 w-5" /> Book appointment
                </Button>
                <Button size="lg" variant="outline" className="h-14 gap-2 rounded-full bg-card/60 px-8 text-base" asChild>
                  <Link href="/adopt">
                    <HeartHandshake className="h-5 w-5" /> Adopt a pet
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                {stats.reviews > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3" aria-hidden>
                      {["gallery-puppy", "gallery-beagle", "gallery-terrier", "gallery-collie"].map((n) => (
                        <Image key={n} src={`/images/${n}.jpg`} alt="" width={40} height={40} className="h-10 w-10 rounded-full border-2 border-background object-cover" />
                      ))}
                    </div>
                    <div>
                      <Stars value={stats.avgRating} size="sm" />
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <strong className="text-foreground">{stats.avgRating.toFixed(1)}</strong> from {stats.reviews.toLocaleString("en-IN")} verified reviews
                      </p>
                    </div>
                  </div>
                )}
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BadgeCheck className="h-5 w-5 text-secondary" /> Free cancellation up to {cancelHours}h before
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/30 to-secondary/20 blur-2xl" />
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-foreground/15 ring-1 ring-border">
                <Image src="/images/hero-grooming.jpg" alt="Happy golden retriever being washed by a PetPlex groomer" fill priority sizes="(max-width: 1024px) 90vw, 560px" className="object-cover object-[65%_50%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-3 top-10 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 pr-5 shadow-xl sm:-left-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">Certified groomers</p>
                  <p className="text-xs text-muted-foreground">Pet first-aid trained</p>
                </div>
              </motion.div>
              {stats.adoptablePets > 0 && (
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-3 bottom-12 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 pr-5 shadow-xl sm:-right-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                    <HeartHandshake className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Ready for adoption</p>
                    <p className="text-sm font-semibold leading-tight">{stats.adoptablePets} lovely pets</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="border-y border-border bg-card/60">
            <dl className="container mx-auto grid grid-cols-2 gap-6 px-4 py-6 text-center md:grid-cols-4">
              {trust.map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-3xl font-bold text-primary">{v}</dd>
                  <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Services */}
        {services.length > 0 && (
          <section id="services" className="scroll-mt-16 py-24">
            <div className="container mx-auto px-4">
              <motion.div {...reveal} custom={0}>
                <SectionHeading eyebrow="Our services" title="Everything your pet needs, under one roof" description="From a fresh trim to a full spa day, our team treats every pet like family." />
              </motion.div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.slice(0, 5).map((s, i) => (
                  <motion.div key={s.id} {...reveal} custom={i}>
                    <ServiceCard service={s} onBook={() => openBooking(s.id)} />
                  </motion.div>
                ))}
                <motion.div {...reveal} custom={5} className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/75 p-8 text-primary-foreground">
                  <PawPrint className="absolute -bottom-6 -right-6 h-40 w-40 rotate-12 opacity-15" />
                  <div className="relative">
                    <h3 className="font-display text-2xl font-bold leading-snug">Not sure what your pet needs?</h3>
                    <p className="mt-3 text-primary-foreground/85">Browse every package with prices, or message our team for a recommendation.</p>
                  </div>
                  <Button variant="secondary" className="relative mt-6 gap-2 self-start rounded-full" asChild>
                    <Link href="/services">
                      See all services <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* About */}
        <section id="about" className="scroll-mt-16 bg-muted/50 py-24">
          <div className="container mx-auto grid items-center gap-16 px-4 lg:grid-cols-2">
            <motion.div {...reveal} custom={0} className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-xl">
                  <Image src="/images/gallery-glasses.jpg" alt="Clever dog wearing glasses" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-xl">
                  <Image src="/images/gallery-beagle.jpg" alt="Happy beagle" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-10">
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-xl">
                  <Image src="/images/gallery-paw.jpg" alt="Cat high-fiving a person" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-xl">
                  <Image src="/images/gallery-collie.jpg" alt="Border collie smiling" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" />
                </div>
              </div>
            </motion.div>
            <motion.div {...reveal} custom={1} className="space-y-6">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why PetPlex</span>
              <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">Care that feels like family, done with professional skill</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We&apos;re certified groomers and animal lovers who believe a visit should be the highlight of your pet&apos;s week — and that every rescue deserves a loving home.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium">
                    <BadgeCheck className="h-5 w-5 shrink-0 text-secondary" />
                    {p}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="h-12 gap-2 rounded-full px-8" onClick={() => openBooking()}>
                Book a visit <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0}>
              <SectionHeading eyebrow="Simple process" title="Three easy steps to a happier pet" />
            </motion.div>
            <ol className="relative grid gap-10 md:grid-cols-3">
              <div aria-hidden className="absolute left-[17%] right-[17%] top-10 hidden border-t-2 border-dashed border-primary/30 md:block" />
              {steps.map((s, i) => (
                <motion.li key={s.title} {...reveal} custom={i} className="relative text-center">
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-card shadow-lg">
                    <s.icon className="h-8 w-8 text-primary" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-muted-foreground">{s.desc}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Adoption */}
        {pets.length > 0 && (
          <section id="adopt" className="scroll-mt-16 bg-muted/50 py-24">
            <div className="container mx-auto px-4">
              <motion.div {...reveal} custom={0}>
                <SectionHeading align="left" eyebrow="Adopt, don't shop" title="Meet friends looking for a home" description="Every pet is health-checked and vaccinated. Apply online — we'll guide you through the rest.">
                  <Button variant="outline" className="shrink-0 gap-2 rounded-full bg-card" asChild>
                    <Link href="/adopt">
                      See all {stats.adoptablePets} pets <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </SectionHeading>
              </motion.div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {pets.map((p, i) => (
                  <motion.div key={p.id} {...reveal} custom={i}>
                    <AdoptionPetCard pet={p} favorite={!!p.isFavorite} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section id="gallery" className="scroll-mt-16 py-24">
            <div className="container mx-auto px-4">
              <motion.div {...reveal} custom={0}>
                <SectionHeading align="left" eyebrow="Gallery" title="Happy pets, happy hearts" description="A peek at some of the wonderful faces who visit us every week.">
                  <Button variant="outline" className="shrink-0 gap-2 rounded-full" asChild>
                    <Link href="/gallery">
                      Open gallery <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </SectionHeading>
              </motion.div>
              <GalleryGrid items={gallery} />
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section id="testimonials" className="scroll-mt-16 bg-muted/50 py-24">
            <div className="container mx-auto px-4">
              <motion.div {...reveal} custom={0}>
                <SectionHeading eyebrow="Testimonials" title="Loved by pets and their parents" />
              </motion.div>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.slice(0, 6).map((t, i) => (
                  <motion.figure key={t.id} {...reveal} custom={i} className="relative flex flex-col rounded-3xl border border-border bg-card p-8 transition-shadow hover:shadow-xl">
                    <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/10" />
                    <Stars value={t.rating} className="mb-5" />
                    <blockquote className="flex-1 leading-relaxed text-card-foreground">&ldquo;{t.content}&rdquo;</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                      <UserAvatar user={avatar(t.name, t.image)} className="h-11 w-11" />
                      <span>
                        <span className="block font-semibold">{t.name}</span>
                        <span className="block text-xs text-muted-foreground">{t.adoptionId ? "Adopted through PetPlex" : "PetPlex customer"}</span>
                      </span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Blog */}
        {posts.length > 0 && (
          <section id="blog" className="scroll-mt-16 py-24">
            <div className="container mx-auto px-4">
              <motion.div {...reveal} custom={0}>
                <SectionHeading align="left" eyebrow="From the blog" title="Tips & stories" description="Grooming advice from our team and happy endings from our adopters.">
                  <Button variant="outline" className="shrink-0 gap-2 rounded-full" asChild>
                    <Link href="/blog">
                      All articles <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </SectionHeading>
              </motion.div>
              <div className="grid gap-6 md:grid-cols-3">
                {posts.map((p, i) => (
                  <motion.div key={p.id} {...reveal} custom={i}>
                    <BlogCard post={p} className="h-full" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 pb-24">
          <motion.div {...reveal} custom={0} className="container relative mx-auto flex min-h-[360px] items-center overflow-hidden rounded-[2.5rem]">
            <Image src="/images/service-walking.jpg" alt="" fill sizes="100vw" className="object-cover" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/20" />
            <div className="relative max-w-2xl space-y-5 p-8 text-background md:p-16">
              <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">Ready to treat your best friend?</h2>
              <p className="text-lg text-background/80">Book in under a minute and give your pet the day they deserve. Free cancellation up to {cancelHours} hours before.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="h-14 gap-2 rounded-full px-8 shadow-xl shadow-primary/30" onClick={() => openBooking()}>
                  <CalendarDays className="h-5 w-5" /> Book now
                </Button>
                <Button size="lg" variant="outline" className="h-14 gap-2 rounded-full border-background/40 bg-transparent px-8 text-background hover:bg-background hover:text-foreground" asChild>
                  <a href={`tel:${contact.phoneHref}`}>
                    <Phone className="h-4 w-4" /> {contact.phone}
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section id="faq" className="scroll-mt-16 bg-muted/50 py-24">
            <div className="container mx-auto grid gap-14 px-4 lg:grid-cols-[1fr_1.4fr]">
              <motion.div {...reveal} custom={0} className="space-y-4 self-start lg:sticky lg:top-28">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">FAQ</span>
                <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">Questions? We&apos;ve got answers</h2>
                <p className="text-lg text-muted-foreground">Can&apos;t find what you&apos;re looking for? Reach out and we&apos;ll be happy to help.</p>
                <Button variant="outline" className="gap-2 rounded-full bg-card" asChild>
                  <a href="#contact">
                    Contact us <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
              <motion.div {...reveal} custom={1}>
                <FaqAccordion faqs={faqs} />
              </motion.div>
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="scroll-mt-16 py-24">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2">
            <motion.div {...reveal} custom={0} className="space-y-8">
              <div>
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact us</span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">Let&apos;s talk about your pet</h2>
              </div>
              <address className="grid gap-4 not-italic sm:grid-cols-2">
                {[
                  { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phoneHref}` },
                  { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
                  { icon: MapPin, label: "Studio", value: contact.address, href: contact.mapsUrl },
                  { icon: Clock, label: "Hours", value: contact.hours.map((h) => `${h.label}: ${h.value}`).join(" · ") },
                ].map((c) => {
                  const body = (
                    <>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
                        <c.icon className="h-5 w-5 text-accent-foreground" />
                      </span>
                      <span>
                        <span className="block text-xs text-muted-foreground">{c.label}</span>
                        <span className="mt-0.5 block text-sm font-medium">{c.value}</span>
                      </span>
                    </>
                  );
                  const cls = "flex items-start gap-4 rounded-2xl border border-border bg-card p-4";
                  return c.href ? (
                    <a key={c.label} href={c.href} {...(c.label === "Studio" && { target: "_blank", rel: "noopener noreferrer" })} className={`${cls} transition-all hover:border-primary/40 hover:shadow-md`}>
                      {body}
                    </a>
                  ) : (
                    <div key={c.label} className={cls}>
                      {body}
                    </div>
                  );
                })}
              </address>
            </motion.div>
            <motion.div {...reveal} custom={1}>
              <ContactForm />
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
