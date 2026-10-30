"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ImageIcon, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PublicShell } from "@/components/site/PublicShell";
import { SectionHeading } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/request";
import type { Paginated } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { GalleryGrid } from "@/features/gallery/components";
import type { GalleryAlbum, GalleryItem } from "@/types/models";

export const GALLERY_PAGE_SIZE = 21; // multiple of the 7-tile bento rhythm

export interface GalleryPageProps {
  albums: GalleryAlbum[];
  album?: string;
  initial: Paginated<GalleryItem> | null;
}

/** Album chips (links → shareable, crawlable) + bento grid with "Load more" on top of the server-rendered first page. */
export default function GalleryPage({ albums, album, initial }: GalleryPageProps) {
  const current = albums.find((a) => a.slug === album);
  const query = useInfiniteQuery({
    queryKey: ["gallery-public", album ?? "all"],
    queryFn: ({ pageParam }) => api.list<GalleryItem>("/gallery/items", { album, page: pageParam, limit: GALLERY_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    // server page may be a few minutes old (ISR) → render it, then refresh in the background
    ...(initial && { initialData: { pages: [initial], pageParams: [1] }, initialDataUpdatedAt: 0 }),
    staleTime: 5 * 60_000,
  });
  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <PublicShell>
      <section className="bg-gradient-to-b from-accent/60 to-background pb-6 pt-12">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            eyebrow="Gallery"
            title={current?.title ?? "Happy pets, happy hearts"}
            description={current?.description ?? "Fresh cuts, spa days and adopted friends — a peek at the faces who visit us every week."}
            className="mb-8"
          />
          {albums.length > 0 && (
            <nav aria-label="Albums" className="flex flex-wrap justify-center gap-2">
              {[{ slug: undefined, title: "Everything", itemCount: undefined }, ...albums].map((a) => {
                const active = a.slug === album;
                return (
                  <Link
                    key={a.slug ?? "all"}
                    href={a.slug ? `/gallery?album=${a.slug}` : "/gallery"}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50")}
                  >
                    {a.title}
                    {a.itemCount !== undefined && <span className={cn("ml-1.5 text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>{a.itemCount}</span>}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {items.length ? <GalleryGrid items={items} /> : <EmptyState icon={ImageIcon} title="No photos yet" description="New photos are added every week — check back soon." />}
        {query.hasNextPage && (
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
              {query.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Load more
            </Button>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
