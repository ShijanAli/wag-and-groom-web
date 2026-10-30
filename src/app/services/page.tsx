import type { Metadata } from "next";
import ServicesPage from "@/views/ServicesPage";
import { serverGet } from "@/lib/api/server";
import { faqJsonLd } from "@/components/site/FaqAccordion";
import type { Faq, PublicSettings, Service, ServiceCategory } from "@/types/models";
import { SITE } from "@/lib/site";

const title = "Pet Grooming, Walking, Sitting & Spa Services and Prices";
const description =
  "Explore PetPlex pet grooming, walking, sitting, daycare and spa services with clear prices in BDT. Certified handlers, pet-safe products, free cancellation. Book online in a minute.";
const ogImage = "/images/service-grooming.jpg";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "pet grooming prices",
    "dog grooming Dhaka",
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

/** Catalog is public + changes rarely → statically rendered and refreshed every 5 minutes (ISR). */
export const revalidate = 300;

const buildJsonLd = (services: Service[], faqs: Faq[]) => ({
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
      name: `${SITE.name} pet care services`,
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          "@id": `${SITE.url}/services/${s.slug}`,
          url: `${SITE.url}/services/${s.slug}`,
          name: s.name,
          description: s.shortDescription ?? s.description ?? undefined,
          ...(s.image && { image: s.image }),
          category: s.category.name,
          provider: { "@type": "LocalBusiness", "@id": `${SITE.url}/#business`, name: SITE.name },
          offers: { "@type": "Offer", price: Number(s.discountPrice ?? s.price), priceCurrency: "BDT" },
          ...(s.reviewsCount > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: s.avgRating, reviewCount: s.reviewsCount } }),
        },
      })),
    },
    faqJsonLd(faqs),
  ].filter(Boolean),
});

export default async function Page() {
  const [services, categories, settings, faqs] = await Promise.all([
    serverGet<Service[]>("/services", { status: "active", limit: 100, sortBy: "sortOrder", sortOrder: "asc" }),
    serverGet<ServiceCategory[]>("/service-categories/tree"),
    serverGet<PublicSettings>("/settings/public"),
    serverGet<Faq[]>("/faqs", { limit: 10 }),
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(services ?? [], faqs ?? [])) }} />
      <ServicesPage services={services ?? []} categories={categories ?? []} settings={settings} faqs={faqs ?? []} />
    </>
  );
}
