import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, roleHomePath } from "@/context/AuthContext";
import { LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { Scissors, Dog, Heart, Clock, Star, ArrowRight, Phone, Mail, MapPin, CalendarDays, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/BookingModal";
import heroPet from "@/assets/hero-pet.jpg";
import gallery1 from "@/assets/pet-gallery-1.jpg";
import gallery2 from "@/assets/pet-gallery-2.jpg";
import gallery3 from "@/assets/pet-gallery-3.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  }),
};

const services = [
  { icon: Scissors, title: "Dog Grooming", price: "$40", desc: "Full grooming with bath, haircut, nail trim & ear cleaning" },
  { icon: Dog, title: "Dog Walking", price: "$20", desc: "Professional 30-min walks with experienced handlers" },
  { icon: Heart, title: "Pet Sitting", price: "$35", desc: "In-home pet sitting with love and attention" },
  { icon: Shield, title: "Pet Daycare", price: "$30", desc: "Safe, fun daycare with supervised play time" },
  { icon: Sparkles, title: "Pet Spa", price: "$60", desc: "Premium spa treatment with massage & premium products" },
];

const testimonials = [
  { name: "Sarah Johnson", pet: "Buddy (Golden Retriever)", rating: 5, text: "HappyPaws transformed Buddy! The grooming was exceptional and the staff was incredibly caring." },
  { name: "Mike Chen", pet: "Whiskers (Persian Cat)", rating: 5, text: "Best pet spa in town! Whiskers came home looking like a show cat. Absolutely recommend!" },
  { name: "Emily Davis", pet: "Max (Labrador)", rating: 5, text: "The dog walking service is fantastic. Max is always so happy and tired after his walks!" },
];

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
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
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</Link>
            <a href="#gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Gallery</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <AuthNavActions onBook={() => { setSelectedService(""); setBookingOpen(true); }} />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Premium Pet Care
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
              Professional Grooming & Care for Your{" "}
              <span className="text-primary">Beloved Pets</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Give your furry friends the love and pampering they deserve. Expert grooming, walking, sitting, and spa services — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" onClick={() => { setSelectedService(""); setBookingOpen(true); }}>
                <CalendarDays className="w-4 h-4" /> Book Appointment
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/services">View Services <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">2,500+</p>
                <p className="text-xs text-muted-foreground">Happy Pets</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">4.9★</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">8+</p>
                <p className="text-xs text-muted-foreground">Years Experience</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img src={heroPet} alt="Happy golden retriever being groomed" className="w-full h-[400px] md:h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">Everything Your Pet Needs</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold text-card-foreground">{s.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">{s.desc}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xl font-bold text-primary">{s.price}</span>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => { setSelectedService(s.title); setBookingOpen(true); }}>Book <ArrowRight className="w-3 h-3" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">How It Works</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Book a Service", desc: "Choose your service and pick a convenient time slot online." },
              { step: "02", title: "Bring Your Pet", desc: "Drop off your pet or we'll come to you with our mobile service." },
              { step: "03", title: "Enjoy the Results", desc: "Pick up your happy, pampered pet looking and feeling amazing!" },
            ].map((item, i) => (
              <motion.div key={item.step} className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Gallery</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">Happy Pets Gallery</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[gallery1, gallery2, gallery3, gallery2, gallery1, gallery3].map((img, i) => (
              <motion.div
                key={i}
                className="relative rounded-2xl overflow-hidden aspect-square group"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <img src={img} alt={`Happy pet ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">What Pet Parents Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="bg-card rounded-2xl p-6 border border-border"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-card-foreground italic">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-semibold text-card-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.pet}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Contact Us</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><Phone className="w-5 h-5 text-accent-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><Mail className="w-5 h-5 text-accent-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">hello@happypaws.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><MapPin className="w-5 h-5 text-accent-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">123 Pet Avenue, San Francisco, CA</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><Clock className="w-5 h-5 text-accent-foreground" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hours</p>
                    <p className="font-medium text-foreground">Mon–Sat: 8AM–7PM | Sun: 9AM–5PM</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-display text-xl font-semibold text-card-foreground mb-4">Send a Message</h3>
                <form className="space-y-4">
                  <input placeholder="Your Name" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input placeholder="Email" type="email" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  <Button className="w-full" size="lg">Send Message</Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Dog className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-background">HappyPaws</span>
            </div>
            <p className="text-background/60 text-sm">© 2026 HappyPaws. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function AuthNavActions({ onBook }: { onBook: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link to={roleHomePath[user.role]}>
          <Button variant="ghost" size="sm"><LayoutDashboard className="w-4 h-4 mr-1.5" />My dashboard</Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
          <LogOut className="w-4 h-4 mr-1.5" />Sign out
        </Button>
        <Button size="sm" onClick={onBook}>Book Now</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
      <Link to="/register"><Button variant="outline" size="sm">Sign up</Button></Link>
      <Button size="sm" onClick={onBook}>Book Now</Button>
    </div>
  );
}

export default Index;
