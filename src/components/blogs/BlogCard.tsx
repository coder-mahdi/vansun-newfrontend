import Link from "next/link";
import type { BlogSummary } from "@/types/blog";

type BlogCardProps = {
  blog: BlogSummary;
  className?: string;
};

export function BlogCard({ blog, className }: BlogCardProps) {
  return (
    <article className={className}>
      <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
      <p>{blog.excerpt}</p>
    </article>
  );
}
