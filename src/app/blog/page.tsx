import type { Metadata } from "next";
import BlogPage from "@/views/BlogPage";
import { serverGet, serverList } from "@/lib/api/server";
import { SITE } from "@/lib/site";
import type { BlogCategory, BlogPost } from "@/types/models";

const PAGE_SIZE = 9;

type Search = Promise<{ category?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { category, page } = await searchParams;
  const title = category ? `${category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Blog` : "Pet Care Blog: Grooming Tips & Adoption Stories";
  const description = "Practical grooming tips, pet health basics and heart-warming adoption stories from the PetPlex team.";
  const canonical = `/blog${category ? `?category=${category}` : ""}`;
  return {
    title,
    description,
    alternates: { canonical },
    // page 2+ is still crawlable, just not a canonical landing page
    robots: page && page !== "1" ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url: canonical, title: `${title} | ${SITE.name}`, description },
  };
}

export default async function Page({ searchParams }: { searchParams: Search }) {
  const { category, page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const [posts, categories] = await Promise.all([
    serverList<BlogPost>("/blog/posts", { category, page: current, limit: PAGE_SIZE }, 120),
    serverGet<BlogCategory[]>("/blog/categories", { limit: 50 }, 600),
  ]);
  return <BlogPage posts={posts?.data ?? []} meta={posts?.meta ?? null} categories={categories ?? []} category={category} />;
}
