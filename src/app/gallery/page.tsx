import type { Metadata } from "next";
import GalleryPage, { GALLERY_PAGE_SIZE } from "@/views/GalleryPage";
import { serverGet, serverList } from "@/lib/api/server";
import { SITE } from "@/lib/site";
import type { GalleryAlbum, GalleryItem } from "@/types/models";

type Search = Promise<{ album?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { album } = await searchParams;
  const title = "Gallery — Happy Pets After Grooming & Adoption";
  const description = `Before-and-after grooming photos, spa days and adopted pets from ${SITE.name}.`;
  return { title, description, alternates: { canonical: album ? `/gallery?album=${album}` : "/gallery" }, openGraph: { url: "/gallery", title: `${title} | ${SITE.name}`, description } };
}

export default async function Page({ searchParams }: { searchParams: Search }) {
  const { album } = await searchParams;
  const [albums, initial] = await Promise.all([
    serverGet<GalleryAlbum[]>("/gallery/albums", { limit: 50 }, 600),
    serverList<GalleryItem>("/gallery/items", { album, page: 1, limit: GALLERY_PAGE_SIZE }, 300),
  ]);
  return <GalleryPage albums={(albums ?? []).filter((a) => a.itemCount > 0)} album={album} initial={initial} />;
}
