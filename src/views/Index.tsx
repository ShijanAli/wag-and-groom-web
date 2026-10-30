"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, CalendarCheck, CalendarDays, Clock, Dog, Heart, LayoutDashboard,
  LogOut, Mail, MapPin, Menu, PawPrint, Phone, Quote, Scissors, ShieldCheck, Sparkles, Star, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookingModal } from "@/components/BookingModal";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FAQS, SITE } from "@/lib/site";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" as const } }),
};
const reveal = { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" }, variants: fadeUp } as const;

const services = [
  { icon: Scissors, title: "Dog Grooming", price: "$40", desc: "Bath, haircut, nail trim & ear cleaning by certified groomers.", img: "/images/service-grooming.jpg", alt: "Freshly groomed golden retriever", tag: "Most popular" },
  { icon: Dog, title: "Dog Walking", price: "$20", desc: "Energetic 30-minute walks with experienced, insured handlers.", img: "/images/service-walking.jpg", alt: "Two happy dogs running on a trail at sunset" },
  { icon: Heart, title: "Pet Sitting", price: "$35", desc: "Loving in-home care so your pet stays comfortable while you're away.", img: "/images/service-sitting.jpg", alt: "Cat and dog cuddling on the grass" },
  { icon: ShieldCheck, title: "Pet Daycare", price: "$30", desc: "Safe, supervised play with plenty of friends and cuddle breaks.", img: "/images/service-daycare.jpg", alt: "Chocolate labrador looking at the camera" },
  { icon: Sparkles, title: "Pet Spa", price: "$60", desc: "Massage, premium products and a full pamper session for the VIPs.", img: "/images/service-spa.jpg", alt: "Relaxed black and white cat", tag: "Premium" },
];

const gallery = [
  { src: "/images/gallery-puppy.jpg", alt: "Golden retriever puppy running at sunset", span: "md:col-span-2 md:row-span-2" },
  { src: "/images/gallery-terrier.jpg", alt: "Jack Russell terrier portrait", span: "" },
  { src: "/images/gallery-beagle.jpg", alt: "Smiling beagle", span: "" },
  { src: "/images/gallery-collie.jpg", alt: "Border collie with a windswept coat", span: "" },
  { src: "/images/gallery-glasses.jpg", alt: "Dog wearing glasses reading a magazine", span: "md:row-span-2" },
  { src: "/images/gallery-paw.jpg", alt: "Cat giving its owner a high five", span: "md:col-span-2" },
  { src: "/images/service-walking.jpg", alt: "Corgi and terrier running at sunset", span: "" },
];

const testimonials = [
  { name: "Sarah Johnson", pet: "Buddy · Golden Retriever", text: "HappyPaws transformed Buddy! The grooming was exceptional and the staff were incredibly caring. He came home smelling amazing and wagging non-stop." },
  { name: "Mike Chen", pet: "Whiskers · Persian Cat", text: "Best pet spa in town! Whiskers came home looking like a show cat. Booking took under a minute and the team kept me updated the whole time." },
  { name: "Emily Davis", pet: "Max · Labrador", text: "The dog walking service is fantastic. Max is always happy and perfectly tired after his walks. I trust them completely with my best friend." },
];

const steps = [
  { icon: CalendarCheck, title: "Book online", desc: "Choose a service and pick a time that works for you. Takes about 60 seconds." },
  { icon: PawPrint, title: "Bring your pet", desc: "Drop off at our studio, or let our team come to you with mobile service." },
  { icon: Heart, title: "Enjoy the results", desc: "Pick up a happy, pampered pet and get photo updates along the way." },
];

const perks = [
  "Certified, gentle groomers",
  "Pet first-aid trained team",
  "Premium, skin-friendly products",
  "Photo updates during every visit",
];

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const openBooking = (service = "") => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} preSelectedService={selectedService} />

      <SiteHeader onBook={() => openBooking()} />

      <main>
        {/* Hero */}
        <section className="relative pt-[72px]">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/70 via-background to-background" />
          <div className="absolute -top-24 -right-24 -z-10 w-[480px] h-[480px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/2 -left-32 -z-10 w-[360px] h-[360px] rounded-full bg-secondary/15 blur-3xl" />

          <div className="container mx-auto px-4 pt-12 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-7">
              <span className="inline-flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-card border border-border shadow-sm text-sm font-medium">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-primary" /></span>
                San Francisco&apos;s favourite pet care studio
              </span>
              <h1 className="font-display text-[2.6rem] sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
                Where every pet leaves <span className="relative inline-block text-primary">wagging<svg aria-hidden className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none"><path d="M2 8 C 50 2, 150 2, 198 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".35" /></svg></span>.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Professional grooming, spa, walking and sitting from certified pet lovers. Gentle hands, premium products, and a booking process that takes under a minute.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-14 px-8 rounded-full text-base gap-2 shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-transform" onClick={() => openBooking()}>
                  <CalendarDays className="w-5 h-5" /> Book appointment
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base gap-2 bg-card/60" asChild>
                  <Link href="/services">Explore services <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3" aria-hidden>
                    {["gallery-puppy", "gallery-beagle", "gallery-terrier", "gallery-collie"].map((n) => (
                      <Image key={n} src={`/images/${n}.jpg`} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover border-2 border-background" />
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5" aria-label="Rated 4.9 out of 5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}</div>
                    <p className="text-xs text-muted-foreground mt-0.5"><strong className="text-foreground">4.9</strong> from 2,500+ happy pets</p>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-9 bg-border" />
                <p className="text-sm text-muted-foreground flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-secondary" /> 8+ years of trusted care</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-primary/30 to-secondary/20 blur-2xl -z-10" />
              <div className="relative aspect-[4/4.4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-foreground/15 ring-1 ring-border">
                <Image src="/images/hero-grooming.jpg" alt="Happy golden retriever being washed by a HappyPaws groomer" fill priority sizes="(max-width: 1024px) 90vw, 560px" className="object-cover object-[65%_50%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              </div>

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-3 sm:-left-8 top-10 bg-card rounded-2xl shadow-xl border border-border p-3.5 pr-5 flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-secondary" /></span>
                <div><p className="text-sm font-semibold leading-tight">Certified groomers</p><p className="text-xs text-muted-foreground">Pet first-aid trained</p></div>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-3 sm:-right-6 bottom-12 bg-card rounded-2xl shadow-xl border border-border p-3.5 pr-5 flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-primary" /></span>
                <div><p className="text-xs text-muted-foreground">Next available</p><p className="text-sm font-semibold leading-tight">Today · 3:00 PM</p></div>
              </motion.div>
            </motion.div>
          </div>

          {/* Trust strip */}
          <div className="border-y border-border bg-card/60">
            <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[["2,500+", "Happy pets groomed"], ["4.9/5", "Average rating"], ["8+ yrs", "Experience"], ["100%", "Gentle, fear-free care"]].map(([v, l]) => (
                <div key={l}><p className="font-display text-3xl font-bold text-primary">{v}</p><p className="text-sm text-muted-foreground mt-1">{l}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-24 scroll-mt-16">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0} className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Our services</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">Everything your pet needs, under one roof</h2>
              <p className="text-muted-foreground mt-4 text-lg">From a fresh trim to a full spa day, our team treats every pet like family.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <motion.article key={s.title} {...reveal} custom={i} className="group relative flex flex-col bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={s.img} alt={s.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                    {s.tag && <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow">{s.tag}</span>}
                    <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/95 text-sm font-bold text-primary shadow">from {s.price}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary transition-colors"><s.icon className="w-5 h-5 text-accent-foreground group-hover:text-primary-foreground transition-colors" /></span>
                      <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed flex-1">{s.desc}</p>
                    <Button variant="ghost" className="mt-5 justify-between px-4 rounded-xl bg-accent/60 hover:bg-primary hover:text-primary-foreground group/btn" onClick={() => openBooking(s.title === "Pet Spa" ? "Pet Spa Treatment" : s.title)}>
                      Book {s.title.toLowerCase()} <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Button>
                  </div>
                </motion.article>
              ))}
              <motion.div {...reveal} custom={5} className="rounded-3xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground p-8 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
                <PawPrint className="absolute -right-6 -bottom-6 w-40 h-40 opacity-15 rotate-12" />
                <div className="relative">
                  <h3 className="font-display text-2xl font-bold leading-snug">Not sure what your pet needs?</h3>
                  <p className="mt-3 text-primary-foreground/85">Browse every package and add-on, or talk to our team for a recommendation.</p>
                </div>
                <Button variant="secondary" className="relative self-start rounded-full mt-6 gap-2" asChild><Link href="/services">See all services <ArrowRight className="w-4 h-4" /></Link></Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-24 bg-muted/50 scroll-mt-16">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...reveal} custom={0} className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl"><Image src="/images/gallery-glasses.jpg" alt="Clever dog wearing glasses" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" /></div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl"><Image src="/images/gallery-beagle.jpg" alt="Happy beagle" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" /></div>
                </div>
                <div className="space-y-4 pt-10">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl"><Image src="/images/gallery-paw.jpg" alt="Cat high-fiving a person" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" /></div>
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl"><Image src="/images/gallery-collie.jpg" alt="Border collie smiling" fill sizes="(max-width: 1024px) 45vw, 280px" className="object-cover" /></div>
                </div>
              </div>
              <div className="absolute -bottom-5 left-6 bg-card border border-border rounded-2xl shadow-xl px-5 py-4">
                <p className="font-display text-3xl font-bold text-primary leading-none">8+</p>
                <p className="text-xs text-muted-foreground mt-1">years caring for pets</p>
              </div>
            </motion.div>
            <motion.div {...reveal} custom={1} className="space-y-6">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Why HappyPaws</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Care that feels like family, done with professional skill</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We&apos;re a team of certified groomers and animal lovers who believe a trip to the groomer should be the highlight of your pet&apos;s week, not a stressful chore.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 text-sm font-medium">
                    <BadgeCheck className="w-5 h-5 text-secondary shrink-0" />{p}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="rounded-full h-12 px-8 gap-2" onClick={() => openBooking()}>Book a visit <ArrowRight className="w-4 h-4" /></Button>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0} className="max-w-2xl mx-auto text-center mb-16">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Simple process</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">Three easy steps to a happier pet</h2>
            </motion.div>
            <div className="relative grid md:grid-cols-3 gap-10">
              <div aria-hidden className="hidden md:block absolute top-10 left-[17%] right-[17%] border-t-2 border-dashed border-primary/30" />
              {steps.map((s, i) => (
                <motion.div key={s.title} {...reveal} custom={i} className="relative text-center">
                  <div className="relative w-20 h-20 mx-auto rounded-3xl bg-card border border-border shadow-lg flex items-center justify-center">
                    <s.icon className="w-8 h-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold mt-6">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs mx-auto">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="py-24 bg-muted/50 scroll-mt-16">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0} className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Gallery</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">Happy pets, happy hearts</h2>
              <p className="text-muted-foreground mt-4 text-lg">A peek at some of the wonderful faces who visit us every week.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[210px] gap-4">
              {gallery.map((g, i) => (
                <motion.figure key={g.src} {...reveal} custom={i} className={`group relative rounded-3xl overflow-hidden ${g.span}`}>
                  <Image src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <figcaption className="absolute bottom-3 left-4 right-4 text-sm font-medium text-background opacity-0 group-hover:opacity-100 transition-opacity">{g.alt}</figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 scroll-mt-16">
          <div className="container mx-auto px-4">
            <motion.div {...reveal} custom={0} className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Testimonials</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">Loved by pets and their parents</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.figure key={t.name} {...reveal} custom={i} className="relative bg-card rounded-3xl p-8 border border-border hover:shadow-xl transition-shadow flex flex-col">
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />
                  <div className="flex gap-1 mb-5" aria-label="5 out of 5 stars">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}</div>
                  <blockquote className="text-card-foreground leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</blockquote>
                  <figcaption className="mt-6 pt-6 border-t border-border flex items-center gap-3">
                    <span className="w-11 h-11 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">{t.name.split(" ").map((n) => n[0]).join("")}</span>
                    <span><span className="block font-semibold">{t.name}</span><span className="block text-xs text-muted-foreground">{t.pet}</span></span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24">
          <motion.div {...reveal} custom={0} className="container mx-auto relative rounded-[2.5rem] overflow-hidden min-h-[360px] flex items-center">
            <Image src="/images/service-walking.jpg" alt="" fill sizes="100vw" className="object-cover" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/20" />
            <div className="relative p-8 md:p-16 max-w-2xl text-background space-y-5">
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Ready to treat your best friend?</h2>
              <p className="text-background/80 text-lg">Book in under a minute and give your pet the day they deserve. Free cancellation up to 24 hours before.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="rounded-full h-14 px-8 gap-2 shadow-xl shadow-primary/30" onClick={() => openBooking()}><CalendarDays className="w-5 h-5" /> Book now</Button>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 gap-2 bg-transparent text-background border-background/40 hover:bg-background hover:text-foreground" asChild>
                  <a href={`tel:${SITE.phoneHref}`}><Phone className="w-4 h-4" /> {SITE.phone}</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-muted/50 scroll-mt-16">
          <div className="container mx-auto px-4 grid lg:grid-cols-[1fr_1.4fr] gap-14">
            <motion.div {...reveal} custom={0} className="lg:sticky lg:top-28 self-start space-y-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">FAQ</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Questions? We&apos;ve got answers</h2>
              <p className="text-muted-foreground text-lg">Can&apos;t find what you&apos;re looking for? Reach out and we&apos;ll be happy to help.</p>
              <Button variant="outline" className="rounded-full gap-2 bg-card" asChild><a href="#contact">Contact us <ArrowRight className="w-4 h-4" /></a></Button>
            </motion.div>
            <motion.div {...reveal} custom={1}>
              <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
                {FAQS.map((f, i) => (
                  <AccordionItem key={f.q} value={`item-${i}`} className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-lg data-[state=open]:border-primary/40 transition-all">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-24 scroll-mt-16">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12">
            <motion.div {...reveal} custom={0} className="space-y-8">
              <div>
                <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">Contact us</span>
                <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">Let&apos;s talk about your pet</h2>
              </div>
              <address className="not-italic grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Phone, label: "Phone", value: SITE.phone, href: `tel:${SITE.phoneHref}` },
                  { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
                  { icon: MapPin, label: "Studio", value: `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region}`, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region}`)}` },
                  { icon: Clock, label: "Hours", value: SITE.hours.map((h) => `${h.label}: ${h.value}`).join(" · ") },
                ].map((c) => {
                  const body = (
                    <>
                      <span className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0"><c.icon className="w-5 h-5 text-accent-foreground" /></span>
                      <span><span className="block text-xs text-muted-foreground">{c.label}</span><span className="block font-medium text-sm mt-0.5">{c.value}</span></span>
                    </>
                  );
                  const cls = "flex items-start gap-4 bg-card border border-border rounded-2xl p-4";
                  return c.href
                    ? <a key={c.label} href={c.href} className={`${cls} hover:border-primary/40 hover:shadow-md transition-all`}>{body}</a>
                    : <div key={c.label} className={cls}>{body}</div>;
                })}
              </address>
            </motion.div>
            <motion.div {...reveal} custom={1}><ContactForm /></motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

function ContactForm() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const field = "w-full px-4 py-3.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    setSent(true);
    toast({ title: "Message sent", description: "Thanks for reaching out. We'll reply within one business day." });
  };

  return (
    <div className="bg-card rounded-3xl p-8 border border-border shadow-xl shadow-foreground/5">
      <h3 className="font-display text-2xl font-semibold">Send us a message</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6">We usually reply within one business day.</p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="sr-only">Your name</span><input required name="name" autoComplete="name" placeholder="Your name" className={field} /></label>
          <label className="block"><span className="sr-only">Email</span><input required name="email" type="email" autoComplete="email" placeholder="Email address" className={field} /></label>
        </div>
        <label className="block"><span className="sr-only">Message</span><textarea required name="message" rows={5} placeholder="Tell us about your pet and what you need…" className={`${field} resize-none`} /></label>
        <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-base gap-2">{sent ? "Send another message" : "Send message"} <ArrowRight className="w-4 h-4" /></Button>
      </form>
    </div>
  );
}

export default Index;
