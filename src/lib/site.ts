export const SITE = {
  name: "PetPlex",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petplex.com",
  tagline: "Professional Pet Grooming, Walking, Sitting & Spa",
  description:
    "PetPlex offers professional dog grooming, pet spa, dog walking, pet sitting and daycare in San Francisco. Certified, gentle groomers. Book your pet's appointment online in 60 seconds.",
  phone: "(555) 123-4567",
  phoneHref: "+15551234567",
  email: "hello@petplex.com",
  address: { street: "123 Pet Avenue", city: "San Francisco", region: "CA", country: "US" },
  hours: [
    { label: "Mon–Sat", value: "8AM–7PM" },
    { label: "Sunday", value: "9AM–5PM" },
  ],
};

export const SERVICE_LIST = [
  { name: "Dog Grooming", price: "40", description: "Full grooming with bath, haircut, nail trim & ear cleaning." },
  { name: "Dog Walking", price: "20", description: "Professional 30-minute walks with experienced handlers." },
  { name: "Pet Sitting", price: "35", description: "In-home pet sitting with love and attention." },
  { name: "Pet Daycare", price: "30", description: "Safe, fun daycare with supervised play time." },
  { name: "Pet Spa", price: "60", description: "Premium spa treatment with massage and premium products." },
];

export const FAQS = [
  {
    q: "How do I book a grooming appointment?",
    a: "Click “Book Appointment”, choose a service, pick a date and time that suits you, and confirm. The whole process takes about a minute and you’ll receive a confirmation right away.",
  },
  {
    q: "How long does a full grooming session take?",
    a: "Most full grooming sessions take 2–3 hours depending on your pet’s breed, coat condition and size. We’ll give you an accurate estimate when you book.",
  },
  {
    q: "Are your groomers trained and certified?",
    a: "Yes. Every PetPlex groomer is professionally certified, trained in pet first aid and experienced in handling nervous or senior pets with patience.",
  },
  {
    q: "Which pets do you accept?",
    a: "We care for dogs and cats of all sizes and breeds. If you have a special request or a pet with medical needs, just tell us in the booking notes.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Of course. You can cancel or reschedule free of charge up to 24 hours before your appointment from your customer dashboard.",
  },
  {
    q: "Do you offer mobile or in-home services?",
    a: "Yes. Dog walking and pet sitting are provided at your home, and our mobile grooming option comes to you. Availability depends on your area, so check when booking.",
  },
];
