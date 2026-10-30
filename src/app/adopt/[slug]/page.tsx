import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdoptionPetPage from "@/views/AdoptionPetPage";
import { serverGet } from "@/lib/api/server";
import { SITE } from "@/lib/site";
import type { AdoptionPet } from "@/types/models";

/** Pages are generated on first visit and refreshed every minute (status changes quickly). */
export const revalidate = 60;
/** No pages at build time — each pet page is generated on first request, then cached (ISR). */
export const generateStaticParams = async () => [];

const getPet = (slug: string) => serverGet<AdoptionPet>(`/adoption-pets/${encodeURIComponent(slug)}`, undefined, 60);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const pet = await getPet((await params).slug);
  if (!pet) return { title: "Pet not found", robots: { index: false } };
  const title = `Adopt ${pet.name} — ${pet.breed ?? pet.petType.name}`;
  const description = pet.description.slice(0, 160);
  const image = pet.images?.[0]?.imageUrl;
  return {
    title,
    description,
    alternates: { canonical: `/adopt/${pet.slug}` },
    openGraph: { type: "article", url: `/adopt/${pet.slug}`, title: `${title} | ${SITE.name}`, description, ...(image && { images: [{ url: image }] }) },
    twitter: { card: "summary_large_image", title, description, ...(image && { images: [image] }) },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const pet = await getPet((await params).slug);
  if (!pet) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Adopt", item: `${SITE.url}/adopt` },
      { "@type": "ListItem", position: 3, name: pet.name, item: `${SITE.url}/adopt/${pet.slug}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AdoptionPetPage pet={pet} />
    </>
  );
}
