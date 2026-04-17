import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogContentSection } from "@/components/blogs/BlogContentSection";
import { BlogHero } from "@/components/blogs/BlogHero";
import { BlogPostFaqSection } from "@/components/blogs/BlogPostFaqSection";
import { BlogPostInternalLinks } from "@/components/blogs/BlogPostInternalLinks";
import { RelatedBlogsSection } from "@/components/blogs/RelatedBlogsSection";
import { fetchBlogPost } from "@/lib/blog-api";
import { blogPostHref } from "@/lib/blog-routes";
import {
  blogMetaKeywordPhrase,
  buildBlogMetaDescription,
} from "@/lib/blog-post-seo";

type Props = { params: Promise<{ slug: string }> };

/** Resolve post from CMS on each request (slug list + body can update without rebuild). */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Post" };

  const description = buildBlogMetaDescription(slug, post.category);
  const phraseWords = blogMetaKeywordPhrase(slug).split(/\s+/).filter(Boolean);
  const baseKeywords = post.tags?.length
    ? post.tags
    : post.keyword
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const keywords = Array.from(new Set([...baseKeywords, ...phraseWords]));

  return {
    title: post.title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: { canonical: blogPostHref(slug) },
    openGraph: {
      title: post.title,
      description,
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
      <BlogPostInternalLinks
        category={post.category}
        articleKeyword={post.keyword}
      />
      <RelatedBlogsSection excludeSlug={slug} />
      <BlogPostFaqSection category={post.category} />
    </article>
  );
}
