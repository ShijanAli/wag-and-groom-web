import type { Metadata } from "next";
import Index from "@/views/Index";
import { FAQS, SERVICE_LIST, SITE } from "@/lib/site";

const title = "Professional Pet Grooming, Walking & Spa in San Francisco";
const ogImage = "/images/hero-grooming.jpg";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | ${title}` },
  description: SITE.description,
  keywords: [
    "pet grooming San Francisco",
    "dog grooming",
    "dog walking",
    "pet sitting",
    "pet daycare",
    "pet spa",
    "cat grooming",
    "mobile pet grooming",
    "book pet grooming online",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: `${SITE.name} | ${title}`,
    description: SITE.description,
    images: [{ url: ogImage, width: 1400, height: 933, alt: "Happy golden retriever being washed by a PetPlex groomer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${title}`,
    description: SITE.description,
    images: [ogImage],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en-US",
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE.url}/#business`,
      name: SITE.name,
      description: SITE.description,
      url: SITE.url,
      image: `${SITE.url}${ogImage}`,
      telephone: SITE.phone,
      email: SITE.email,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.region,
        addressCountry: SITE.address.country,
      },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "08:00", closes: "19:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "09:00", closes: "17:00" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Pet care services",
        itemListElement: SERVICE_LIST.map((s) => ({
          "@type": "Offer",
          price: s.price,
          priceCurrency: "USD",
          itemOffered: { "@type": "Service", name: s.name, description: s.description },
        })),
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Index />
    </>
  );
}
