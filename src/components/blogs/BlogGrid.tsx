import { cn } from "@/lib/helpers";
import type { BlogSummary } from "@/types/blog";
import { BlogCard } from "./BlogCard";

type BlogGridProps = {
  posts: BlogSummary[];
  emptyMessage?: string;
  className?: string;
};

export function BlogGrid({
  posts,
  emptyMessage = "No posts match this filter.",
  className,
}: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <p className={cn("blog-grid__empty", className)} role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("blog-grid", className)}>
      {posts.map((blog) => (
        <BlogCard key={blog.slug} blog={blog} />
      ))}
    </div>
  );
}
