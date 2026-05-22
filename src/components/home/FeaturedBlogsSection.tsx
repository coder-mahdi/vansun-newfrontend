import Image from "next/image";
import Link from "next/link";

import { blogPostHref } from "@/lib/blog-routes";
import { cn } from "@/lib/helpers";
import type { BlogSummary, BlogVideo } from "@/types/blog";

type FeaturedBlogsSectionProps = {
  posts: BlogSummary[];
  className?: string;
  /** From `GET /content/videos` only; when absent, no video column is shown. */
  latestVideo?: BlogVideo | null;
};

export function FeaturedBlogsSection({
  posts,
  className,
  latestVideo: latestVideoProp,
}: FeaturedBlogsSectionProps) {
  const [latest, ...rest] = posts;
  const recentTitles = rest.slice(0, 6);

  const apiVideo = latestVideoProp?.youtubeId ? latestVideoProp : null;

  return (
    <section
      className={cn("featured-blogs-section", className)}
      aria-labelledby="featured-blogs-heading"
    >
      <h2 id="featured-blogs-heading" className="featured-blogs-section__title">
        From the blog
      </h2>

      {!latest ? (
        <p className="featured-blogs-section__empty">No posts yet.</p>
      ) : (
        <div
          className={cn(
            "featured-blogs-layout",
            !apiVideo && "featured-blogs-layout--single"
          )}
        >
          <div className="featured-blogs-layout__main">
            <div className="featured-blogs-column featured-blogs-column--articles">
              <article className="featured-blogs-featured">
                <Link
                  href={blogPostHref(latest.slug)}
                  className="featured-blogs-featured__link"
                >
                  {latest.coverImageUrl ? (
                    <div className="featured-blogs-featured__media">
                      <Image
                        src={latest.coverImageUrl}
                        alt={latest.title}
                        fill
                        className="featured-blogs-featured__img"
                        sizes="(max-width: 1022px) 100vw, 50vw"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <div className="featured-blogs-featured__body">
                    <h3 className="featured-blogs-featured__heading">
                      {latest.title}
                    </h3>
                    <p className="featured-blogs-featured__excerpt">
                      {latest.excerpt}
                    </p>
                    <span className="featured-blogs-featured__cta">
                      Read article
                    </span>
                  </div>
                </Link>
              </article>
            </div>

            {apiVideo ? (
              <div className="featured-blogs-column featured-blogs-column--video">
                <div className="featured-blogs-video">
                  <h3
                    className="featured-blogs-video__label"
                    id="featured-video-label"
                  >
                    Latest video
                  </h3>
                  <div
                    className="featured-blogs-video__frame"
                    aria-labelledby="featured-video-label"
                  >
                    <iframe
                      title={apiVideo.title}
                      src={`https://www.youtube-nocookie.com/embed/${apiVideo.youtubeId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      className="featured-blogs-video__embed"
                    />
                  </div>
                  <p className="featured-blogs-video__caption">
                    {apiVideo.title}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <nav
            className="featured-blogs-titles"
            aria-label="Recent blog posts"
          >
            <h3 className="featured-blogs-titles__label">Recent posts</h3>
            {recentTitles.length === 0 ? (
              <ul className="featured-blogs-titles__list">
                <li>
                  <Link href="/blogs">Blog</Link>
                </li>
              </ul>
            ) : (
              <ul className="featured-blogs-titles__list">
                {recentTitles.map((post) => (
                  <li key={post.slug}>
                    <Link href={blogPostHref(post.slug)}>{post.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      )}
    </section>
  );
}
