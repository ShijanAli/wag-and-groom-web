import Link from "next/link";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PublicShell } from "@/components/site/PublicShell";
import { SectionHeading } from "@/components/site/Section";
import { BlogCard } from "@/features/blog/components";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/api/types";
import type { BlogCategory, BlogPost } from "@/types/models";

const href = (category?: string, page?: number) => {
  const sp = new URLSearchParams();
  if (category) sp.set("category", category);
  if (page && page > 1) sp.set("page", String(page));
  return sp.size ? `/blog?${sp}` : "/blog";
};

/** Server-rendered blog index: category chips + paginated cards (plain links → crawlable). */
export default function BlogPage({ posts, meta, categories, category }: { posts: BlogPost[]; meta: PaginationMeta | null; categories: BlogCategory[]; category?: string }) {
  const [first, ...rest] = posts;
  const showFeatured = !category && meta?.page === 1 && first;
  const current = categories.find((c) => c.slug === category);

  return (
    <PublicShell>
      <section className="bg-gradient-to-b from-accent/60 to-background pb-6 pt-12">
        <div className="container mx-auto px-4">
          <SectionHeading as="h1" eyebrow="The PetPlex blog" title={current ? current.name : "Tips, stories & news"} description="Grooming advice from our team, pet health basics and happy adoption endings." className="mb-8" />
          <nav aria-label="Categories" className="flex flex-wrap justify-center gap-2">
            {[{ slug: undefined, name: "All posts" }, ...categories].map((c) => {
              const active = c.slug === category;
              return (
                <Link
                  key={c.slug ?? "all"}
                  href={href(c.slug)}
                  aria-current={active ? "page" : undefined}
                  className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50")}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {!posts.length ? (
          <EmptyState icon={Newspaper} title="No posts here yet" description="Check back soon — new articles are on the way." />
        ) : (
          <div className="space-y-8">
            {showFeatured && <BlogCard post={first} featured />}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(showFeatured ? rest : posts).map((p) => (
                <BlogCard key={p.id} post={p} className="h-full" />
              ))}
            </div>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            <PageLink to={meta.page - 1} disabled={meta.page <= 1} category={category} label="Previous">
              <ChevronLeft className="h-4 w-4" /> Newer
            </PageLink>
            <span className="px-4 text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <PageLink to={meta.page + 1} disabled={meta.page >= meta.totalPages} category={category} label="Next">
              Older <ChevronRight className="h-4 w-4" />
            </PageLink>
          </nav>
        )}
      </section>
    </PublicShell>
  );
}

function PageLink({ to, disabled, category, label, children }: { to: number; disabled: boolean; category?: string; label: string; children: React.ReactNode }) {
  const cls = "inline-flex items-center gap-1 rounded-full border bg-card px-4 py-2 text-sm font-medium";
  if (disabled) return <span className={cn(cls, "opacity-40")} aria-disabled>{children}</span>;
  return (
    <Link href={href(category, to)} className={cn(cls, "hover:border-primary/50")} aria-label={label} rel={label === "Next" ? "next" : "prev"}>
      {children}
    </Link>
  );
}
