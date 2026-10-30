"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cdn } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/types/models";
import { embedUrl } from "./api";

/** Bento layout: every 7 items repeat the same rhythm of big/tall/wide tiles. */
const SPANS = ["md:col-span-2 md:row-span-2", "", "", "", "md:row-span-2", "md:col-span-2", ""];

const thumbOf = (i: GalleryItem) => (i.mediaType === "video" ? i.thumbnailUrl : i.fileUrl);

/** Masonry-ish grid + full-screen lightbox (← → keys, swipe-free buttons, before/after toggle, video playback). */
export function GalleryGrid({ items, className }: { items: GalleryItem[]; className?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ul className={cn("grid auto-rows-[170px] grid-cols-2 gap-3 md:auto-rows-[210px] md:grid-cols-4 md:gap-4", className)}>
        {items.map((item, i) => {
          const src = thumbOf(item);
          return (
            <li key={item.id} className={cn("group relative overflow-hidden rounded-3xl bg-muted", SPANS[i % SPANS.length])}>
              <button type="button" onClick={() => setIndex(i)} className="block h-full w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring" aria-label={`Open ${item.title ?? "photo"}`}>
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element -- API image via CDN helper
                  <img src={cdn(src, 720)} alt={item.altText ?? item.title ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                {item.mediaType === "video" && (
                  <span className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-background/90 shadow-lg">
                    <Play className="ml-0.5 h-6 w-6 fill-primary text-primary" />
                  </span>
                )}
                {item.beforeImageUrl && <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-semibold">Before & after</span>}
                {item.title && <span className="absolute inset-x-4 bottom-3 truncate text-left text-sm font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">{item.title}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <Lightbox items={items} index={index} onIndex={setIndex} />
    </>
  );
}

function Lightbox({ items, index, onIndex }: { items: GalleryItem[]; index: number | null; onIndex: (i: number | null) => void }) {
  const [showBefore, setShowBefore] = useState(false);
  const item = index === null ? null : items[index];
  const go = useCallback((d: number) => index !== null && (setShowBefore(false), onIndex((index + d + items.length) % items.length)), [index, items.length, onIndex]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => (e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" ? go(-1) : undefined);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const video = item?.mediaType === "video" ? embedUrl(item.fileUrl) : null;

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && (setShowBefore(false), onIndex(null))}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden border-0 bg-black p-0 text-white [&>button]:hidden">
        <DialogTitle className="sr-only">{item?.title ?? "Gallery"}</DialogTitle>
        <DialogDescription className="sr-only">{item?.caption ?? "Gallery image"}</DialogDescription>
        {item && (
          <div className="relative">
            <div className="flex max-h-[80vh] min-h-[40vh] items-center justify-center bg-black">
              {video ? (
                video.kind === "iframe" ? (
                  <iframe src={video.src} title={item.title ?? "Video"} className="aspect-video w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                ) : (
                  <video src={video.src} poster={item.thumbnailUrl ?? undefined} controls autoPlay className="max-h-[80vh] w-full" />
                )
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cdn(showBefore && item.beforeImageUrl ? item.beforeImageUrl : item.fileUrl, 1600)} alt={item.altText ?? item.title ?? ""} className="max-h-[80vh] w-auto object-contain" />
              )}
            </div>
            <button type="button" onClick={() => onIndex(null)} aria-label="Close" className="absolute right-3 top-3 rounded-full bg-black/60 p-2 hover:bg-black/80">
              <X className="h-5 w-5" />
            </button>
            {items.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                {item.title && <p className="font-semibold">{item.title}</p>}
                {item.caption && <p className="text-sm text-white/70">{item.caption}</p>}
              </div>
              <div className="flex items-center gap-3">
                {item.beforeImageUrl && (
                  <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-semibold" role="group" aria-label="Before or after">
                    {(["Before", "After"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        aria-pressed={showBefore === (l === "Before")}
                        onClick={() => setShowBefore(l === "Before")}
                        className={cn("rounded-full px-3 py-1", showBefore === (l === "Before") ? "bg-white text-black" : "text-white/80")}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-sm tabular-nums text-white/60">
                  {(index ?? 0) + 1} / {items.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
