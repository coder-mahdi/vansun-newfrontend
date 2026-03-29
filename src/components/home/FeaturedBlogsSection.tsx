import { BlogGrid } from "@/components/blogs/BlogGrid";
import { cn } from "@/lib/helpers";

export function FeaturedBlogsSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("featured-blogs-section", className)}
      aria-labelledby="featured-blogs-heading"
    >
      <h2 id="featured-blogs-heading">From the blog</h2>
      <BlogGrid />
    </section>
  );
}
