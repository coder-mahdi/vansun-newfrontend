import { cn } from "@/lib/helpers";
import { fetchBlogSummaries } from "@/lib/blog-api";
import { BlogGrid } from "./BlogGrid";

type RelatedBlogsSectionProps = {
  excludeSlug?: string;
  className?: string;
};

export async function RelatedBlogsSection({
  excludeSlug,
  className,
}: RelatedBlogsSectionProps) {
  const all = await fetchBlogSummaries();
  const posts = (
    excludeSlug ? all.filter((p) => p.slug !== excludeSlug) : all
  ).slice(0, 4);

  return (
    <section
      className={cn("related-blogs-section", className)}
      aria-labelledby="related-blogs-heading"
    >
      <h2 id="related-blogs-heading">Related</h2>
      <BlogGrid posts={posts} emptyMessage="No related posts yet." />
    </section>
  );
}
