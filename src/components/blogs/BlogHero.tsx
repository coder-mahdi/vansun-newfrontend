import Image from "next/image";

import { cn } from "@/lib/helpers";

type BlogHeroProps = {
  title: string;
  /** When set, used for the page H1 (e.g. main keyword from slug). */
  heading?: string;
  publishedAt?: string;
  /** Absolute URL when available (featured image or first inline image). */
  coverImageUrl?: string;
  className?: string;
};

function formatPublishedLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogHero({
  title,
  heading,
  publishedAt,
  coverImageUrl,
  className,
}: BlogHeroProps) {
  return (
    <header className={cn("blog-hero", className)}>
      <h1>{heading ?? title}</h1>
      {publishedAt ? (
        <div className="blog-hero__meta">
          <time dateTime={publishedAt}>{formatPublishedLabel(publishedAt)}</time>
        </div>
      ) : null}
      <div
        className={cn(
          "blog-hero__cover",
          !coverImageUrl && "blog-hero__cover--empty"
        )}
      >
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(min-width: 768px) 28rem, min(92vw, 28rem)"
            className="blog-hero__cover-img"
            priority
            unoptimized
          />
        ) : (
          <div className="blog-hero__cover-placeholder" aria-hidden>
            <svg
              className="blog-hero__cover-placeholder-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 80 64"
              aria-hidden
            >
              <rect
                width="78"
                height="46"
                x="1"
                y="9"
                stroke="currentColor"
                strokeWidth="2"
                rx="4"
              />
              <path
                fill="currentColor"
                fillOpacity="0.35"
                d="M8 46h20l8-12 10 12h28V17l-14 14-10-10-14 18-8-8H8v25Z"
              />
              <circle cx="24" cy="21" r="5" fill="currentColor" fillOpacity="0.5" />
            </svg>
            <span className="blog-hero__cover-placeholder-text">
              Article cover
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
