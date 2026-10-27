import type { Metadata } from "next";
import ServicesPage from "@/views/ServicesPage";
import { PACKAGES, SERVICES, SERVICE_FAQS } from "@/lib/services";
import { SITE } from "@/lib/site";

const title = "Pet Grooming, Walking, Sitting & Spa Services and Prices";
const description =
  "Explore HappyPaws services and prices in San Francisco: dog grooming from $40, dog walking from $20, pet sitting, daycare and luxury pet spa. Certified groomers, pet-safe products, free cancellation. Book online.";
const ogImage = "/images/service-grooming.jpg";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "pet grooming prices",
    "dog grooming San Francisco",
    "dog walking near me",
    "pet sitting",
    "pet daycare",
    "pet spa",
    "cat grooming",
    "grooming packages",
  ],
  alternates: { canonical: "/services" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    url: "/services",
    siteName: SITE.name,
    title: `${title} | ${SITE.name}`,
    description,
    images: [{ url: ogImage, width: 1400, height: 933, alt: "Freshly groomed golden retriever" }],
  },
  twitter: { card: "summary_large_image", title: `${title} | ${SITE.name}`, description, images: [ogImage] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.url}/services` },
      ],
    },
    {
      "@type": "ItemList",
      name: "HappyPaws pet care services",
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          "@id": `${SITE.url}/services#${s.slug}`,
          name: s.title,
          description: s.desc,
          image: `${SITE.url}${s.image}`,
          url: `${SITE.url}/services#${s.slug}`,
          provider: { "@type": "LocalBusiness", "@id": `${SITE.url}/#business`, name: SITE.name },
          areaServed: { "@type": "City", name: SITE.address.city },
          offers: { "@type": "Offer", price: s.price, priceCurrency: "USD" },
        },
      })),
    },
    {
      "@type": "OfferCatalog",
      name: "Grooming packages",
      itemListElement: PACKAGES.map((p) => ({
        "@type": "Offer",
        price: p.price,
        priceCurrency: "USD",
        itemOffered: { "@type": "Service", name: p.name, description: p.desc },
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: SERVICE_FAQS.map((f) => ({
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
      <ServicesPage />
    </>
  );
}
