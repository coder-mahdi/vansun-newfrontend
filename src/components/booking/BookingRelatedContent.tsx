import Image from "next/image";
import Link from "next/link";
import { BlogCard } from "@/components/blogs/BlogCard";
import { fetchBlogSummaries, fetchBlogVideos } from "@/lib/blog-api";
import { cn } from "@/lib/helpers";
import type { BlogCategory, BlogSummary, BlogVideo } from "@/types/blog";

/** Only posts in this category, newest first (booking pages stay on-topic). */
function pickLatestPostsForBooking(
  posts: BlogSummary[],
  category: BlogCategory,
  limit: number
): BlogSummary[] {
  const byDate = (a: BlogSummary, b: BlogSummary) =>
    b.publishedAt.localeCompare(a.publishedAt);
  return [...posts]
    .filter((p) => p.category === category)
    .sort(byDate)
    .slice(0, limit);
}

/** Only videos tagged for this category, newest first when `publishedAt` exists. */
function pickLatestVideosForBooking(
  videos: BlogVideo[],
  category: BlogCategory,
  limit: number
): BlogVideo[] {
  const byDate = (a: BlogVideo, b: BlogVideo) => {
    const ad = a.publishedAt ?? "";
    const bd = b.publishedAt ?? "";
    if (ad !== bd) return bd.localeCompare(ad);
    return b.id.localeCompare(a.id);
  };
  return [...videos]
    .filter((v) => v.category === category)
    .sort(byDate)
    .slice(0, limit);
}

function youtubeThumbUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

type BookingRelatedContentProps = {
  preferCategory: BlogCategory;
  className?: string;
};

/** Below booking FAQ: two blog cards + two video teasers (thumbnail + external link, no embed). */
export async function BookingRelatedContent({
  preferCategory,
  className,
}: BookingRelatedContentProps) {
  const [allPosts, videos] = await Promise.all([
    fetchBlogSummaries(),
    fetchBlogVideos(),
  ]);

  const posts = pickLatestPostsForBooking(allPosts, preferCategory, 2);
  const latestVideos = pickLatestVideosForBooking(videos, preferCategory, 2);

  return (
    <div className={cn("booking-related", className)}>
      <section
        className="booking-related__block booking-related__block--articles"
        aria-labelledby="booking-related-blog-heading"
      >
        <h2 id="booking-related-blog-heading" className="booking-related__title">
          Latest articles
        </h2>
        <div className="booking-related__grid booking-related__grid--posts">
          {posts.map((blog) => (
            <BlogCard key={blog.slug} blog={blog} />
          ))}
        </div>
        <p className="booking-related__footer-link">
          <Link href="/blogs">View all articles</Link>
        </p>
      </section>

      <section
        className="booking-related__block booking-related__block--videos"
        aria-labelledby="booking-related-videos-heading"
      >
        <h2 id="booking-related-videos-heading" className="booking-related__title">
          Quick guides before your visit
        </h2>
        <div className="booking-related__grid booking-related__grid--videos">
          {latestVideos.map((v) => (
            <article key={v.id} className="booking-related-video">
              <a
                href={`https://www.youtube.com/watch?v=${encodeURIComponent(v.youtubeId)}`}
                className="booking-related-video__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="booking-related-video__media">
                  <Image
                    src={youtubeThumbUrl(v.youtubeId)}
                    alt=""
                    width={480}
                    height={360}
                    className="booking-related-video__img"
                    sizes="(min-width: 900px) 400px, (min-width: 600px) 45vw, 100vw"
                  />
                  <span className="booking-related-video__play" aria-hidden>
                    ▶
                  </span>
                </div>
                <h3 className="booking-related-video__title">{v.title}</h3>
              </a>
              <p className="booking-related-video__excerpt">{v.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
