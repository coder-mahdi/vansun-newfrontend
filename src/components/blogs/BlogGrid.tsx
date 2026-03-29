import { blogSummaries } from "@/data/blogs";
import { cn } from "@/lib/helpers";
import { BlogCard } from "./BlogCard";

export function BlogGrid({ className }: { className?: string }) {
  return (
    <div className={cn("blog-grid", className)}>
      {blogSummaries.map((blog) => (
        <BlogCard key={blog.slug} blog={blog} />
      ))}
    </div>
  );
}
