import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailPage from "@/views/ServiceDetailPage";
import { serverGet } from "@/lib/api/server";
import { SITE } from "@/lib/site";
import type { GalleryItem, PublicReview, PublicSettings, RatingSummary, Service } from "@/types/models";

export const revalidate = 300;
export const generateStaticParams = async () => [];

const getService = (slug: string) => serverGet<Service>(`/services/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await getService((await params).slug);
  if (!s || s.status !== "active") return { title: "Service not found", robots: { index: false } };
  const description = (s.shortDescription ?? s.description ?? `${s.name} by ${SITE.name}`).slice(0, 160);
  return {
    title: `${s.name} — ${s.category.name}`,
    description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { type: "website", url: `/services/${s.slug}`, title: `${s.name} | ${SITE.name}`, description, ...(s.image && { images: [{ url: s.image }] }) },
    twitter: { card: "summary_large_image", title: s.name, description, ...(s.image && { images: [s.image] }) },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service || service.status !== "active") notFound();

  const [summary, gallery, siblings, topReviews, settings] = await Promise.all([
    serverGet<RatingSummary>(`/services/${service.id}/rating-summary`),
    serverGet<GalleryItem[]>("/gallery/items", { serviceId: service.id, limit: 7 }),
    serverGet<Service[]>("/services", { status: "active", categoryId: service.categoryId, limit: 4 }),
    serverGet<PublicReview[]>(`/services/${service.id}/reviews`, { limit: 5, sortBy: "rating", sortOrder: "desc" }),
    serverGet<PublicSettings>("/settings/public"),
  ]);
  const related = (siblings ?? []).filter((s) => s.id !== service.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.url}/services` },
          { "@type": "ListItem", position: 3, name: service.name, item: `${SITE.url}/services/${service.slug}` },
        ],
      },
      {
        "@type": "Service",
        "@id": `${SITE.url}/services/${service.slug}`,
        name: service.name,
        description: service.shortDescription ?? service.description ?? undefined,
        category: service.category.name,
        ...(service.image && { image: service.image }),
        provider: { "@type": "LocalBusiness", "@id": `${SITE.url}/#business`, name: SITE.name },
        offers: { "@type": "Offer", price: Number(service.discountPrice ?? service.price), priceCurrency: "USD", availability: "https://schema.org/InStock" },
        ...(summary?.totalReviews && {
          aggregateRating: { "@type": "AggregateRating", ratingValue: summary.averageRating, reviewCount: summary.totalReviews, bestRating: 5, worstRating: 1 },
          review: (topReviews ?? []).map((r) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            author: { "@type": "Person", name: r.user.firstName },
            datePublished: r.createdAt.slice(0, 10),
            ...(r.comment && { reviewBody: r.comment }),
          })),
        }),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServiceDetailPage service={service} summary={summary} gallery={gallery ?? []} related={related} settings={settings} />
    </>
  );
}
