"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/helpers";
import type { BlogCategory, BlogSummary, BlogVideo } from "@/types/blog";
import { BlogGrid } from "./BlogGrid";

type Filter = "all" | BlogCategory;

type BlogsPageClientProps = {
  posts: BlogSummary[];
  videos: BlogVideo[];
  className?: string;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tattoo", label: "Tattoo" },
  { value: "piercing", label: "Piercing" },
];

const POSTS_PAGE_SIZE = 6;

function BlogVideoBlock({ video: v }: { video: BlogVideo }) {
  return (
    <article className="blogs-page__video-card">
      <div className="blogs-page__video-frame">
        <iframe
          title={v.title}
          src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="blogs-page__video-embed"
        />
      </div>
      <h3 className="blogs-page__video-title">{v.title}</h3>
      <p className="blogs-page__video-keyword">{v.keyword}</p>
      <p className="blogs-page__video-excerpt">{v.excerpt}</p>
    </article>
  );
}

export function BlogsPageClient({
  posts,
  videos,
  className,
}: BlogsPageClientProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [postsVisible, setPostsVisible] = useState(POSTS_PAGE_SIZE);
  const [videosExpanded, setVideosExpanded] = useState(false);

  useEffect(() => {
    console.log("[BlogList] props blogs:", posts.length, posts);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((p) => p.category === filter);
  }, [posts, filter]);

  useEffect(() => {
    setPostsVisible(POSTS_PAGE_SIZE);
  }, [filter]);

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, postsVisible),
    [filteredPosts, postsVisible]
  );
  const hasMorePosts = filteredPosts.length > postsVisible;

  const latestVideos = videos.slice(0, 4);
  const olderVideos = videos.slice(4);
  const hasOlderVideos = olderVideos.length > 0;

  return (
    <div className={cn("blogs-page", className)}>
      <header className="blogs-page__header">
        <h1 className="blogs-page__title">Vansun Blog</h1>
      </header>

      <section
        className="blogs-page__posts"
        aria-labelledby="blogs-list-heading"
      >
        <div className="blogs-page__posts-head">
          <h2 id="blogs-list-heading" className="blogs-page__section-title">
            Articles
          </h2>
          <div
            className="blogs-page__filters"
            role="group"
            aria-label="Filter by category"
          >
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "blogs-page__filter",
                  filter === value && "blogs-page__filter--active"
                )}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div
          id="blogs-posts-visible"
          className="blogs-page__posts-list"
          aria-live="polite"
        >
          <BlogGrid posts={visiblePosts} />
        </div>
        {hasMorePosts ? (
          <button
            type="button"
            className="blogs-page__show-more blogs-page__show-more--posts"
            onClick={() =>
              setPostsVisible((n) =>
                Math.min(n + POSTS_PAGE_SIZE, filteredPosts.length)
              )
            }
          >
            Show more
          </button>
        ) : null}
      </section>

      {videos.length > 0 ? (
        <section
          className="blogs-page__videos"
          aria-labelledby="blogs-videos-heading"
        >
          <h2 id="blogs-videos-heading" className="blogs-page__section-title">
            Videos
          </h2>
          <ul className="blogs-page__video-list">
            {latestVideos.map((v) => (
              <li key={v.id} className="blogs-page__video-item">
                <BlogVideoBlock video={v} />
              </li>
            ))}
          </ul>

          {hasOlderVideos ? (
            <>
              <button
                type="button"
                className="blogs-page__show-more"
                aria-expanded={videosExpanded}
                aria-controls="blogs-videos-more"
                onClick={() => setVideosExpanded((e) => !e)}
              >
                {videosExpanded ? "Show less" : "Show more"}
              </button>
              {videosExpanded ? (
                <div
                  id="blogs-videos-more"
                  className="blogs-page__videos-more"
                >
                  <ul className="blogs-page__video-list blogs-page__video-list--more">
                    {olderVideos.map((v) => (
                      <li key={v.id} className="blogs-page__video-item">
                        <BlogVideoBlock video={v} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
