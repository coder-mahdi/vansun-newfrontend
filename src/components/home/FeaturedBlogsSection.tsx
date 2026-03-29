import { BlogGrid } from "@/components/blogs/BlogGrid";

export function FeaturedBlogsSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="featured-blogs-heading">
      <h2 id="featured-blogs-heading">From the blog</h2>
      <BlogGrid />
    </section>
  );
}
