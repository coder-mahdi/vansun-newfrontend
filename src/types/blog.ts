export type BlogSummary = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

export type BlogPost = BlogSummary & {
  content: string;
};
