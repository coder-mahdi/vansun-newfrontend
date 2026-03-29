import { notFound } from "next/navigation";
import { BlogContentSection } from "@/components/blogs/BlogContentSection";
import { BlogHero } from "@/components/blogs/BlogHero";
import { RelatedBlogsSection } from "@/components/blogs/RelatedBlogsSection";
import { blogPostsBySlug } from "@/data/blogs";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPostsBySlug[slug];
  if (!post) notFound();

  return (
    <article>
      <BlogHero title={post.title} publishedAt={post.publishedAt} />
      <BlogContentSection content={post.content} />
      <RelatedBlogsSection />
    </article>
  );
}
