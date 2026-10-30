import type { Metadata } from "next";
import { Suspense } from "react";
import AdoptPage, { ADOPT_DEFAULTS } from "@/views/AdoptPage";
import { serverGet, serverList } from "@/lib/api/server";
import { SITE } from "@/lib/site";
import type { AdoptionPet, PetType } from "@/types/models";

const title = "Adopt a Dog or Cat";
const description = "Meet vaccinated, health-checked dogs and cats looking for a home. Browse, save favourites and apply to adopt online.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/adopt" },
  openGraph: { type: "website", url: "/adopt", title: `${title} | ${SITE.name}`, description, images: [{ url: "/images/gallery-puppy.jpg" }] },
};

/** First page is rendered on the server (SEO + instant paint); filters run on the client. */
export const revalidate = 60;

export default async function Page() {
  const [initial, types] = await Promise.all([
    serverList<AdoptionPet>("/adoption-pets", { ...ADOPT_DEFAULTS }, 60),
    serverGet<PetType[]>("/pet-types", { limit: 100, sortBy: "name", sortOrder: "asc" }),
  ]);
  return (
    <Suspense>
      <AdoptPage initial={initial} petTypes={(types ?? []).map((t) => ({ value: t.id, label: t.name }))} />
    </Suspense>
  );
}
