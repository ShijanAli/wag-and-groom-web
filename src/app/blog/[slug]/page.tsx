import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostPage from "@/views/BlogPostPage";
import { serverGet } from "@/lib/api/server";
import { fullName } from "@/lib/auth";
import { SITE } from "@/lib/site";
import type { BlogPost } from "@/types/models";

export const revalidate = 300;
export const generateStaticParams = async () => [];

const getPost = (slug: string) => serverGet<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return { title: "Post not found", robots: { index: false } };
  const title = p.metaTitle || p.title;
  const description = (p.metaDescription || p.excerpt || p.content?.replace(/[#>*_`[\]()!-]/g, "").slice(0, 160) || "").trim();
  return {
    title,
    description,
    alternates: { canonical: `/blog/${p.slug}` },
    authors: [{ name: fullName(p.author) }],
    openGraph: {
      type: "article",
      url: `/blog/${p.slug}`,
      title: `${title} | ${SITE.name}`,
      description,
      publishedTime: p.publishedAt ?? undefined,
      modifiedTime: p.updatedAt,
      section: p.category.name,
      ...(p.coverImage && { images: [{ url: p.coverImage, width: 1200, height: 630 }] }),
    },
    twitter: { card: "summary_large_image", title, description, ...(p.coverImage && { images: [p.coverImage] }) },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  // public API never returns drafts/scheduled posts, so a missing post is a 404
  if (!post) notFound();
  const sameCategory = await serverGet<BlogPost[]>("/blog/posts", { categoryId: post.categoryId, limit: 4 });
  const related = (sameCategory ?? []).filter((p) => p.id !== post.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.metaDescription || post.excerpt || undefined,
        ...(post.coverImage && { image: post.coverImage }),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: { "@type": "Person", name: fullName(post.author) },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
        articleSection: post.category.name,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE.url}/blog` },
          { "@type": "ListItem", position: 2, name: post.category.name, item: `${SITE.url}/blog?category=${post.category.slug}` },
          { "@type": "ListItem", position: 3, name: post.title, item: `${SITE.url}/blog/${post.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPostPage post={post} related={related} />
    </>
  );
}
