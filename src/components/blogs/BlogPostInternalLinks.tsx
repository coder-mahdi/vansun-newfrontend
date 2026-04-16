import Link from "next/link";

import { cn } from "@/lib/helpers";
import type { BlogCategory } from "@/types/blog";

type BlogPostInternalLinksProps = {
  category: BlogCategory;
  className?: string;
};

export function BlogPostInternalLinks({
  category,
  className,
}: BlogPostInternalLinksProps) {
  const isPiercing = category === "piercing";
  const bookHref = isPiercing ? "/book/piercing" : "/book/tattoo";
  const galleryHref = isPiercing ? "/gallery/piercing" : "/gallery/tattoo";
  const topic = isPiercing ? "piercing" : "tattoo";
  const topicTitle = isPiercing ? "Piercing" : "Tattoo";

  return (
    <section
      className={cn("blog-post-internal-links", className)}
      aria-labelledby="blog-internal-links-heading"
    >
      <h2 id="blog-internal-links-heading" className="blog-post-internal-links__title">
        Plan your visit
      </h2>
      <p className="blog-post-internal-links__intro">
        Explore our {topic} gallery, see services, and book when you are ready.
      </p>
      <ul className="blog-post-internal-links__list">
        <li>
          <Link href={galleryHref}>{topicTitle} gallery</Link>
        </li>
        <li>
          <Link href="/#services">Services</Link>
        </li>
        <li>
          <Link href={bookHref}>Book {topic}</Link>
        </li>
      </ul>
    </section>
  );
}
