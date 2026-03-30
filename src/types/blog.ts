export type BlogSummary = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
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
