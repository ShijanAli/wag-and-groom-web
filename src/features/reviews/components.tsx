"use client";

import { MessageSquareReply } from "lucide-react";
import { Stars } from "@/components/common/Rating";
import { SITE } from "@/lib/site";
import { cdn } from "@/lib/image";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReviewImage } from "@/types/models";

interface ReviewLike {
  rating: number;
  title: string | null;
  comment: string | null;
  images: ReviewImage[];
  adminReply: string | null;
  repliedAt: string | null;
}

/** Stars + title + comment + photos + the team's reply — same look in admin, dashboard and the public page. */
export function ReviewBody({ review: r, clamp, hideStars, className }: { review: ReviewLike; clamp?: boolean; hideStars?: boolean; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {!hideStars && <Stars value={r.rating} size="sm" />}
      {r.title && <p className="font-semibold leading-snug">{r.title}</p>}
      {r.comment && <p className={cn("whitespace-pre-line text-sm leading-relaxed text-muted-foreground", clamp && "line-clamp-2")}>{r.comment}</p>}
      {r.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {r.images.map((img) => (
            <a key={img.id} href={img.image} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdn(img.image, 160, 160)} alt="Review photo" loading="lazy" className={cn("object-cover", clamp ? "h-10 w-10" : "h-20 w-20")} />
            </a>
          ))}
        </div>
      )}
      {r.adminReply && !clamp && (
        <div className="rounded-xl border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <MessageSquareReply className="h-3.5 w-3.5" /> Reply from {SITE.name}
            {r.repliedAt && <span className="font-normal text-muted-foreground">· {formatDate(r.repliedAt)}</span>}
          </p>
          <p className="whitespace-pre-line leading-relaxed">{r.adminReply}</p>
        </div>
      )}
    </div>
  );
}
