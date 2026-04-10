import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogContentSection } from "@/components/blogs/BlogContentSection";
import { BlogHero } from "@/components/blogs/BlogHero";
import { RelatedBlogsSection } from "@/components/blogs/RelatedBlogsSection";
import { fetchBlogPost } from "@/lib/blog-api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Post" };
  const keywords = post.tags?.length
    ? post.tags
    : post.keyword
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  return {
    title: post.title,
    description: post.excerpt,
    ...(keywords.length > 0 ? { keywords } : {}),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      ...(post.coverImageUrl
        ? { images: [{ url: post.coverImageUrl, alt: post.title }] }
        : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="blog-post-page">
      <BlogHero
        title={post.title}
        publishedAt={post.publishedAt}
        coverImageUrl={post.coverImageUrl}
      />
      <BlogContentSection content={post.content} />
      <RelatedBlogsSection excludeSlug={slug} />
    </article>
  );
}
