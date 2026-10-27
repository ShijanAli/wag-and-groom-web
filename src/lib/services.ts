export interface ServiceDetail {
  slug: string;
  /** Name used by BookingModal, keep in sync with its SERVICES list. */
  title: string;
  price: number;
  duration: string;
  tagline: string;
  desc: string;
  features: string[];
  image: string;
  alt: string;
}

export const SERVICES: ServiceDetail[] = [
  {
    slug: "dog-grooming",
    title: "Dog Grooming",
    price: 40,
    duration: "60 min",
    tagline: "Fresh, fluffy and fabulous",
    desc: "Professional grooming that keeps your dog looking and feeling their best. Our certified groomers use premium, pet-safe products and work at your dog's pace.",
    features: ["Bath & blow dry", "Breed-specific haircut", "Nail trimming & filing", "Ear cleaning", "Teeth brushing", "Cologne & bow finish"],
    image: "/images/service-grooming.jpg",
    alt: "Freshly groomed golden retriever with a happy expression",
  },
  {
    slug: "dog-walking",
    title: "Dog Walking",
    price: 20,
    duration: "30 min",
    tagline: "Fresh air, happy tails",
    desc: "Reliable, professional dog walking with experienced and insured handlers who treat your pup like family.",
    features: ["Neighborhood or park walks", "GPS-tracked route", "Photo updates sent to you", "Fresh water provided", "Waste cleanup included", "Flexible scheduling"],
    image: "/images/service-walking.jpg",
    alt: "Corgi and terrier running together on a trail at sunset",
  },
  {
    slug: "pet-sitting",
    title: "Pet Sitting",
    price: 35,
    duration: "Full day",
    tagline: "Home comforts while you're away",
    desc: "In-home pet sitting so your furry friend stays comfortable in their own environment while you're away.",
    features: ["Feeding & fresh water", "Medication administration", "Playtime & exercise", "Litter box / cleanup", "Daily photo updates", "Mail & plant care"],
    image: "/images/service-sitting.jpg",
    alt: "Cat and dog cuddling together on the grass",
  },
  {
    slug: "pet-daycare",
    title: "Pet Daycare",
    price: 30,
    duration: "Full day",
    tagline: "Playtime with new best friends",
    desc: "A safe, fun and supervised environment where your pet can socialize, play and rest all day long.",
    features: ["Supervised group play", "Indoor & outdoor areas", "Rest periods", "Healthy snacks", "Temperament matching", "Webcam access"],
    image: "/images/service-daycare.jpg",
    alt: "Chocolate labrador looking curiously at the camera",
  },
  {
    slug: "pet-spa",
    title: "Pet Spa Treatment",
    price: 60,
    duration: "90 min",
    tagline: "The ultimate pamper day",
    desc: "The ultimate pampering experience for your pet. Premium products and relaxing treatments for total rejuvenation.",
    features: ["Aromatherapy bath", "Deep conditioning treatment", "Relaxation massage", "Paw & pad moisturizing", "Premium shampoo & conditioner", "Blueberry facial"],
    image: "/images/service-spa.jpg",
    alt: "Relaxed black and white cat after a spa treatment",
  },
];

export interface Package {
  name: string;
  price: number;
  desc: string;
  features: string[];
  popular: boolean;
}

export const PACKAGES: Package[] = [
  { name: "Basic Grooming", price: 25, desc: "Essential grooming to keep your pet clean and tidy.", features: ["Bath & blow dry", "Nail trim", "Ear cleaning", "Brush out"], popular: false },
  { name: "Full Grooming", price: 40, desc: "Complete grooming service for a fresh, polished look.", features: ["Everything in Basic", "Breed-specific haircut", "Teeth brushing", "Cologne & bow", "Sanitary trim"], popular: true },
  { name: "Premium Spa", price: 75, desc: "The ultimate luxury grooming and wellness experience.", features: ["Everything in Full", "Aromatherapy bath", "Relaxation massage", "Deep conditioning", "Paw moisturizing", "Blueberry facial"], popular: false },
];

export const SERVICE_FAQS = [
  { q: "How much does dog grooming cost?", a: "Dog grooming starts at $40 for a full groom including bath, haircut, nail trim and ear cleaning. Final pricing depends on your dog's size and coat, and we confirm it before we start." },
  { q: "How long does each service take?", a: "Dog walking is 30 minutes, dog grooming about 60 minutes, and a pet spa treatment around 90 minutes. Pet sitting and daycare are full-day services." },
  { q: "Do I need to bring anything for daycare or sitting?", a: "Just your pet's food, any medication and a favourite blanket or toy. We provide water, bowls, treats and everything else." },
  { q: "Are vaccinations required?", a: "For daycare and group services we ask for up-to-date rabies, DHPP and Bordetella vaccinations to keep every pet safe. Grooming and walking only need rabies." },
  { q: "Can I change or cancel a booking?", a: "Yes. Reschedule or cancel for free up to 24 hours before your appointment from your customer dashboard." },
  { q: "Do you offer discounts for regular visits?", a: "Our grooming packages bundle services for a better price, and regulars get priority booking. Ask our team about a recurring plan." },
];
