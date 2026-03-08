import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Scissors, Dog, Heart, Shield, Sparkles, Check, ArrowRight, Clock, Star, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingModal } from "@/components/BookingModal";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const services = [
  {
    icon: Scissors, title: "Dog Grooming", price: 40, duration: "60 min",
    desc: "Professional grooming that keeps your dog looking and feeling their best. Our experienced groomers use premium, pet-safe products.",
    features: ["Bath & blow dry", "Breed-specific haircut", "Nail trimming & filing", "Ear cleaning", "Teeth brushing", "Cologne & bow finish"],
    image: "🐕",
  },
  {
    icon: Dog, title: "Dog Walking", price: 20, duration: "30 min",
    desc: "Reliable, professional dog walking with experienced handlers who treat your pup like family.",
    features: ["Neighborhood or park walks", "GPS-tracked route", "Photo updates sent to you", "Fresh water provided", "Waste cleanup included", "Flexible scheduling"],
    image: "🦮",
  },
  {
    icon: Heart, title: "Pet Sitting", price: 35, duration: "Full Day",
    desc: "In-home pet sitting so your furry friend stays comfortable in their own environment while you're away.",
    features: ["Feeding & fresh water", "Medication administration", "Playtime & exercise", "Litter box / cleanup", "Daily photo updates", "Mail & plant care"],
    image: "🏠",
  },
  {
    icon: Shield, title: "Pet Daycare", price: 30, duration: "Full Day",
    desc: "A safe, fun, and supervised environment where your pet can socialize and play all day long.",
    features: ["Supervised group play", "Indoor & outdoor areas", "Rest periods", "Healthy snacks", "Temperament matching", "Webcam access"],
    image: "🐾",
  },
  {
    icon: Sparkles, title: "Pet Spa Treatment", price: 60, duration: "90 min",
    desc: "The ultimate pampering experience for your pet. Premium products and relaxing treatments for total rejuvenation.",
    features: ["Aromatherapy bath", "Deep conditioning treatment", "Relaxation massage", "Paw & pad moisturizing", "Premium shampoo & conditioner", "Blueberry facial"],
    image: "✨",
  },
];

const packages = [
  {
    name: "Basic Grooming",
    price: 25,
    desc: "Essential grooming to keep your pet clean and tidy.",
    features: ["Bath & blow dry", "Nail trim", "Ear cleaning", "Brush out"],
    popular: false,
  },
  {
    name: "Full Grooming",
    price: 40,
    desc: "Complete grooming service for a fresh, polished look.",
    features: ["Everything in Basic", "Breed-specific haircut", "Teeth brushing", "Cologne & bow", "Sanitary trim"],
    popular: true,
  },
  {
    name: "Premium Spa",
    price: 75,
    desc: "The ultimate luxury grooming and wellness experience.",
    features: ["Everything in Full", "Aromatherapy bath", "Relaxation massage", "Deep conditioning", "Paw moisturizing", "Blueberry facial"],
    popular: false,
  },
];

export default function ServicesPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const openBooking = (svc: string) => { setSelectedService(svc); setBookingOpen(true); };
  return (
    <div className="min-h-screen bg-background">
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} preSelectedService={selectedService} />
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Dog className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">HappyPaws</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/services" className="text-sm font-medium text-foreground transition-colors">Services</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm">Admin</Button></Link>
            <Button size="sm" onClick={() => openBooking("")}>Book Now</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16">
        <div className="bg-accent/50 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Our Services</span>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
                Premium Care for Every Pet
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                From basic grooming to luxury spa treatments, we offer a complete range of professional pet care services tailored to your furry friend's needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="py-20">
        <div className="container mx-auto px-4 space-y-16">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              className={`flex flex-col ${idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-14 items-center`}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            >
              {/* Visual */}
              <div className="flex-1 w-full">
                <div className="bg-accent rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center aspect-[4/3] relative overflow-hidden">
                  <span className="text-8xl md:text-9xl mb-4">{service.image}</span>
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    From ${service.price}
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 text-sm text-accent-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" /> {service.duration}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{service.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Button className="gap-2" onClick={() => openBooking(service.title)}>
                    <CalendarDays className="w-4 h-4" /> Book {service.title}
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium text-foreground">4.9</span>
                    <span>(120+ reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Packages</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">Choose Your Package</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Save more with our bundled grooming packages. Perfect for regular visits.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className={`border-border h-full relative overflow-hidden ${pkg.popular ? "ring-2 ring-primary shadow-xl" : "hover:shadow-lg"} transition-shadow`}>
                  {pkg.popular && (
                    <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1.5">
                      MOST POPULAR
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="font-display text-xl font-semibold text-card-foreground">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pkg.desc}</p>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-bold text-foreground">${pkg.price}</span>
                      <span className="text-muted-foreground text-sm"> / session</span>
                    </div>
                    <div className="space-y-2.5 flex-1">
                      {pkg.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-card-foreground">
                          <Check className="w-4 h-4 text-success shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-6 gap-2" variant={pkg.popular ? "default" : "outline"} onClick={() => openBooking(pkg.name)}>
                      Book {pkg.name} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-primary rounded-3xl p-10 md:p-16 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
              Ready to Pamper Your Pet?
            </h2>
            <p className="text-primary-foreground/80 mt-3 max-w-lg mx-auto">
              Book your first appointment today and give your furry friend the care they deserve.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button size="lg" variant="secondary" className="gap-2" onClick={() => openBooking("")}>
                <CalendarDays className="w-4 h-4" /> Book Appointment
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/#contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Dog className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-background">HappyPaws</span>
          </div>
          <p className="text-background/60 text-sm">© 2026 HappyPaws. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
