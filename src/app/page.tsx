import type { Metadata } from "next";
import Index, { type HomeData } from "@/views/Index";
import type { ActivePromotion } from "@/features/promotions/PromoBanner";
import { serverGet, serverList } from "@/lib/api/server";
import { SITE, contactInfo } from "@/lib/site";
import { faqJsonLd } from "@/components/site/FaqAccordion";
import { openingHoursJsonLd } from "@/lib/hours";
import type { AdoptionPet, BlogPost, Faq, GalleryItem, PublicSettings, Service, Testimonial } from "@/types/models";

const title = "Pet Grooming, Spa, Walking & Adoption";
const ogImage = "/images/hero-grooming.jpg";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | ${title}` },
  description: SITE.description,
  keywords: ["pet grooming", "dog grooming Dhaka", "cat grooming", "pet spa", "dog walking", "pet sitting", "pet daycare", "adopt a dog", "adopt a cat", "book pet grooming online"],
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
  twitter: { card: "summary_large_image", title: `${SITE.name} | ${title}`, description: SITE.description, images: [ogImage] },
};

/** Marketing content changes a few times a day at most → ISR, refreshed every 5 minutes. */
export const revalidate = 300;

async function getHomeData(): Promise<HomeData> {
  const [services, featuredGallery, latestGallery, testimonials, faqs, posts, pets, settings, promotions] = await Promise.all([
    serverGet<Service[]>("/services", { status: "active", limit: 100, sortBy: "sortOrder", sortOrder: "asc" }),
    serverGet<GalleryItem[]>("/gallery/items", { isFeatured: true, limit: 7 }),
    serverGet<GalleryItem[]>("/gallery/items", { limit: 7 }),
    serverGet<Testimonial[]>("/testimonials", { isFeatured: true, limit: 6, sortBy: "createdAt", sortOrder: "desc" }),
    serverGet<Faq[]>("/faqs", { limit: 6 }),
    serverGet<BlogPost[]>("/blog/posts", { limit: 3 }),
    serverList<AdoptionPet>("/adoption-pets", { status: "available", limit: 4 }),
    serverGet<PublicSettings>("/settings/public"),
    serverGet<ActivePromotion[]>("/promotions/active"),
  ]);

  const all = services ?? [];
  const reviews = all.reduce((n, s) => n + s.reviewsCount, 0);
  const avgRating = reviews ? all.reduce((sum, s) => sum + Number(s.avgRating) * s.reviewsCount, 0) / reviews : 0;
  // featured first, then the catalog order
  const ordered = [...all.filter((s) => s.isFeatured), ...all.filter((s) => !s.isFeatured)];
  // too few featured photos → show the latest ones so the section never looks empty
  const gallery = (featuredGallery?.length ?? 0) >= 4 ? featuredGallery! : (latestGallery ?? []);

  return {
    services: ordered,
    gallery,
    testimonials: testimonials ?? [],
    faqs: faqs ?? [],
    posts: posts ?? [],
    pets: pets?.data ?? [],
    settings,
    stats: { services: all.length, reviews, avgRating, adoptablePets: pets?.meta.total ?? 0 },
    // the one ending soonest with a public code
    promotion: (promotions ?? []).filter((p) => p.code).sort((a, b) => a.endsAt.localeCompare(b.endsAt))[0] ?? null,
  };
}

const buildJsonLd = ({ services, faqs, settings, stats }: HomeData) => {
  const c = contactInfo(settings);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE.url}/#website`, url: SITE.url, name: SITE.name, description: SITE.description, inLanguage: "en" },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE.url}/#business`,
        name: SITE.name,
        description: SITE.description,
        url: SITE.url,
        image: `${SITE.url}${ogImage}`,
        telephone: c.phone,
        email: c.email,
        priceRange: "$$",
        currenciesAccepted: "USD",
        address: { "@type": "PostalAddress", streetAddress: c.address, addressCountry: SITE.country },
        ...(c.socials.length && { sameAs: c.socials.map((s) => s.url) }),
        openingHoursSpecification: openingHoursJsonLd(settings?.opening_hours),
        ...(stats.reviews > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: stats.avgRating.toFixed(1), reviewCount: stats.reviews } }),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Pet care services",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            price: Number(s.discountPrice ?? s.price),
            priceCurrency: "USD",
            url: `${SITE.url}/services/${s.slug}`,
            itemOffered: { "@type": "Service", name: s.name, description: s.shortDescription ?? undefined },
          })),
        },
      },
      faqJsonLd(faqs),
    ].filter(Boolean),
  };
};

export default async function Page() {
  const data = await getHomeData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(data)) }} />
      <Index {...data} />
    </>
  );
}
