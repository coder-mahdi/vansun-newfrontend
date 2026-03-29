import { blogSummaries } from "@/data/blogs";
import { BlogCard } from "./BlogCard";

export function BlogGrid({ className }: { className?: string }) {
  return (
    <div className={className}>
      {blogSummaries.map((blog) => (
        <BlogCard key={blog.slug} blog={blog} />
      ))}
    </div>
  );
}
