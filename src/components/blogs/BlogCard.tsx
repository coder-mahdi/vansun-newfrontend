import Image from "next/image";
import Link from "next/link";

import { blogPostHref } from "@/lib/blog-routes";
import { cn } from "@/lib/helpers";
import type { BlogSummary } from "@/types/blog";

type BlogCardProps = {
  blog: BlogSummary;
  className?: string;
};

export function BlogCard({ blog, className }: BlogCardProps) {
  return (
    <article className={cn("blog-card", className)}>
      <Link href={blogPostHref(blog.slug)} className="blog-card__media-link">
        <div className="blog-card__media">
          {blog.coverImageUrl ? (
            <Image
              src={blog.coverImageUrl}
              alt={blog.title}
              fill
              className="blog-card__img"
              sizes="(min-width: 1023px) 32vw, (min-width: 600px) 45vw, 100vw"
              unoptimized
            />
          ) : (
            <div className="blog-card__placeholder" aria-hidden />
          )}
        </div>
      </Link>
      <div className="blog-card__body">
        <p className="blog-card__keyword">{blog.keyword}</p>
        <h2 className="blog-card__title">
          <Link href={blogPostHref(blog.slug)}>{blog.title}</Link>
        </h2>
        <p className="blog-card__excerpt">{blog.excerpt}</p>
        <Link href={blogPostHref(blog.slug)} className="blog-card__read-more">
          Read more
        </Link>
      </div>
    </article>
  );
}
