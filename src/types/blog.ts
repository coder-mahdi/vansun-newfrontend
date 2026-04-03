export type BlogCategory = "tattoo" | "piercing";

export type BlogSummary = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: BlogCategory;
  /** SEO / tag from backend (single keyword or label). */
  keyword: string;
  /** Optional cover URL (e.g. from `devCmsAsset` in mock mode). */
  coverImageUrl?: string;
};

export type BlogPost = BlogSummary & {
  content: string;
};

export type FeaturedLatestVideo = {
  title: string;
  /** YouTube video ID for embed; omit if not set yet. */
  youtubeId?: string;
  /** Thumbnail in `public/dev-cms/` when not using YouTube embed. */
  thumbnailLocal?: string;
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
};
