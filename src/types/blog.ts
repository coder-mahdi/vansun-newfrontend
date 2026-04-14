export type BlogCategory = "tattoo" | "piercing";

export type BlogSummary = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: BlogCategory;
  /**
   * SEO: comma-separated tags from WordPress (`tags` in vansun API), or legacy keyword.
   * Use `tags` when you need an array for meta keywords.
   */
  keyword: string;
  /** WordPress post tags (names), for SEO / meta keywords. */
  tags?: string[];
  /** Optional cover URL (e.g. from `devCmsAsset` in mock mode). */
  coverImageUrl?: string;
};

export type BlogPost = BlogSummary & {
  content: string;
};

export type BlogVideo = {
  id: string;
  title: string;
  excerpt: string;
  keyword: string;
  /** Resolved 11-char id for youtube-nocookie embed. */
  youtubeId: string;
  /** When set, booking pages can prefer tattoo vs piercing clips. */
  category?: BlogCategory;
  /** ISO date string; newest-first on booking “related videos” when set. */
  publishedAt?: string;
};
