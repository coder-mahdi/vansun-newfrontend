import Image from "next/image";
import Link from "next/link";

import { featuredLatestVideo } from "@/data/blogs";
import { devCmsAsset } from "@/lib/content-assets";
import { cn } from "@/lib/helpers";
import type { BlogSummary } from "@/types/blog";

type FeaturedBlogsSectionProps = {
  posts: BlogSummary[];
  className?: string;
};

export function FeaturedBlogsSection({
  posts,
  className,
}: FeaturedBlogsSectionProps) {
  const [latest, ...rest] = posts;
  const recentTitles = rest.slice(0, 6);

  const videoThumbUrl = featuredLatestVideo.thumbnailLocal
    ? devCmsAsset(featuredLatestVideo.thumbnailLocal)
    : undefined;

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
        <div className="featured-blogs-layout">
          <div className="featured-blogs-column featured-blogs-column--articles">
            <article className="featured-blogs-featured">
              <Link
                href={`/blogs/${latest.slug}`}
                className="featured-blogs-featured__link"
              >
                {latest.coverImageUrl ? (
                  <div className="featured-blogs-featured__media">
                    <Image
                      src={latest.coverImageUrl}
                      alt=""
                      fill
                      className="featured-blogs-featured__img"
                      sizes="(max-width: 1022px) 100vw, 50vw"
                    />
                  </div>
                ) : null}
                <div className="featured-blogs-featured__body">
                  <p className="featured-blogs-featured__keyword">{latest.keyword}</p>
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

            <nav
              className="featured-blogs-titles"
              aria-label="Recent blog posts"
            >
              <h3 className="featured-blogs-titles__label">Recent posts</h3>
              {recentTitles.length === 0 ? (
                <p className="featured-blogs-titles__empty">More posts soon.</p>
              ) : (
                <ul className="featured-blogs-titles__list">
                  {recentTitles.map((post) => (
                    <li key={post.slug}>
                      <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </div>

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
                {featuredLatestVideo.youtubeId ? (
                  <iframe
                    title={featuredLatestVideo.title}
                    src={`https://www.youtube-nocookie.com/embed/${featuredLatestVideo.youtubeId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    className="featured-blogs-video__embed"
                  />
                ) : videoThumbUrl ? (
                  <div className="featured-blogs-video__thumb-wrap">
                    <Image
                      src={videoThumbUrl}
                      alt=""
                      fill
                      className="featured-blogs-video__thumb"
                      sizes="(max-width: 1022px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div
                    className="featured-blogs-video__placeholder"
                    role="img"
                  />
                )}
              </div>
              <p className="featured-blogs-video__caption">
                {featuredLatestVideo.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
