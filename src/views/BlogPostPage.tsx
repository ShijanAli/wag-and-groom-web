import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronRight, Clock } from "lucide-react";
import { Markdown } from "@/components/common/Markdown";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PublicShell } from "@/components/site/PublicShell";
import { Button } from "@/components/ui/button";
import { BlogCard, readingTime } from "@/features/blog/components";
import { ShareButtons } from "@/features/blog/ShareButtons";
import { fullName } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { cdn } from "@/lib/image";
import { SITE } from "@/lib/site";
import type { BlogPost } from "@/types/models";

export default function BlogPostPage({ post: p, related }: { post: BlogPost; related: BlogPost[] }) {
  const url = `${SITE.url}/blog/${p.slug}`;
  return (
    <PublicShell>
      <article>
        <header className="bg-gradient-to-b from-accent/60 to-background">
          <div className="container mx-auto max-w-3xl px-4 pb-10 pt-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/blog?category=${p.category.slug}`} className="hover:text-primary">
                {p.category.name}
              </Link>
            </nav>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">{p.title}</h1>
            {p.excerpt && <p className="mt-4 text-xl leading-relaxed text-muted-foreground">{p.excerpt}</p>}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={p.author} className="h-11 w-11" />
                <div className="text-sm">
                  <p className="font-semibold">{fullName(p.author)}</p>
                  <p className="flex items-center gap-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <time dateTime={p.publishedAt ?? p.createdAt}>{formatDate(p.publishedAt ?? p.createdAt)}</time>
                    </span>
                    {readingTime(p) && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {readingTime(p)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <ShareButtons url={url} title={p.title} />
            </div>
          </div>
        </header>

        {p.coverImage && (
          <div className="container mx-auto max-w-5xl px-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- API image via CDN helper */}
            <img src={cdn(p.coverImage, 1600, 840)} alt="" className="aspect-[1200/630] w-full rounded-[2rem] object-cover shadow-xl" />
          </div>
        )}

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <Markdown className="prose-lg">{p.content ?? ""}</Markdown>

          <aside className="mt-14 flex flex-col items-start gap-4 rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl font-bold">Give your pet some love today</p>
              <p className="mt-1 text-primary-foreground/85">Grooming, spa and more — book online in a minute.</p>
            </div>
            <Button variant="secondary" className="rounded-full" asChild>
              <Link href="/services">See services</Link>
            </Button>
          </aside>

          <div className="mt-10 flex items-center justify-between border-t pt-6">
            <Button variant="ghost" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" /> All articles
              </Link>
            </Button>
            <ShareButtons url={url} title={p.title} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 font-display text-3xl font-bold">Keep reading</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r.id} post={r} className="h-full" />
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
