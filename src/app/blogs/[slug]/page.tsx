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
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  return (
    <article>
      <BlogHero title={post.title} publishedAt={post.publishedAt} />
      <BlogContentSection content={post.content} />
      <RelatedBlogsSection excludeSlug={slug} />
    </article>
  );
}
