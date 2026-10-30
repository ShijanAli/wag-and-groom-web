import Link from "next/link";
import { ArrowUpRight, Clock, Newspaper } from "lucide-react";
import { fullName } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { cdn } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/models";

export function readingTime(p: Pick<BlogPost, "readingTimeMinutes">) {
  return p.readingTimeMinutes ? `${p.readingTimeMinutes} min read` : null;
}

/** Blog card for the home page and /blog. `featured` = the large first card. */
export function BlogCard({ post: p, featured = false, className }: { post: BlogPost; featured?: boolean; className?: string }) {
  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl", featured && "lg:flex-row", className)}>
      <div className={cn("relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-accent to-primary/15", featured && "lg:aspect-auto lg:w-3/5")}>
        {p.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- API image via CDN helper
          <img src={cdn(p.coverImage, featured ? 1000 : 640, featured ? 640 : 400)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <Newspaper className="absolute inset-0 m-auto h-12 w-12 text-primary/40" />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">{p.category.name}</span>
      </div>
      <div className={cn("flex flex-1 flex-col gap-3 p-6", featured && "lg:justify-center lg:p-10")}>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={p.publishedAt ?? p.createdAt}>{formatDate(p.publishedAt ?? p.createdAt)}</time>
          {readingTime(p) && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {readingTime(p)}
              </span>
            </>
          )}
        </p>
        <h3 className={cn("font-display font-semibold leading-snug", featured ? "text-2xl md:text-3xl" : "text-xl")}>
          <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {p.title}
          </Link>
        </h3>
        {p.excerpt && <p className={cn("text-sm leading-relaxed text-muted-foreground", !featured && "line-clamp-3")}>{p.excerpt}</p>}
        <p className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="text-muted-foreground">By {fullName(p.author)}</span>
          <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </p>
      </div>
    </article>
  );
}
