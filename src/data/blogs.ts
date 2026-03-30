import { devCmsAsset } from "@/lib/content-assets";

import type { BlogPost, BlogSummary, FeaturedLatestVideo } from "@/types/blog";

type BlogSeed = Omit<BlogSummary, "coverImageUrl"> & {
  coverFile?: string;
};

const seeds: BlogSeed[] = [
  {
    slug: "welcome-to-vansun-studio",
    title: "Welcome to Vansun Studio",
    excerpt:
      "A quick look at how we work, what to expect on your first visit, and how we keep every session safe and comfortable.",
    publishedAt: "2026-03-28",
    coverFile: "blog-cover-welcome.jpg",
  },
  {
    slug: "aftercare-essentials",
    title: "Aftercare essentials for tattoos and piercings",
    excerpt:
      "Simple daily habits that help healing and keep colour and jewellery looking their best.",
    publishedAt: "2026-03-15",
    coverFile: "blog-cover-aftercare.jpg",
  },
  {
    slug: "choosing-your-first-tattoo",
    title: "Choosing your first tattoo",
    excerpt:
      "Placement, size, and style tips so your first piece feels right for years to come.",
    publishedAt: "2026-02-20",
    coverFile: "blog-cover-first-tattoo.jpg",
  },
  {
    slug: "piercing-jewelry-guide",
    title: "A short guide to piercing jewellery",
    excerpt:
      "Materials, gauges, and what we recommend for initial vs healed piercings.",
    publishedAt: "2026-01-10",
    coverFile: "blog-cover-jewelry.jpg",
  },
  {
    slug: "granville-street-studio",
    title: "Life on Granville Street",
    excerpt:
      "Why we chose this neighbourhood and how to find us when you visit downtown Vancouver.",
    publishedAt: "2025-12-05",
    coverFile: "blog-cover-granville.jpg",
  },
];

function withCover(s: BlogSeed): BlogSummary {
  const { coverFile, ...rest } = s;
  return {
    ...rest,
    coverImageUrl: coverFile ? devCmsAsset(coverFile) : undefined,
  };
}

/** Newest first (for home featured layout and listings). */
export const blogSummaries: BlogSummary[] = [...seeds]
  .map(withCover)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const blogPostsBySlug: Record<string, BlogPost> = Object.fromEntries(
  blogSummaries.map((s) => [
    s.slug,
    {
      ...s,
      content: `<p>${s.excerpt}</p>`,
    },
  ])
);

/** Home “latest video” block; set `youtubeId` when you have a real upload. */
export const featuredLatestVideo: FeaturedLatestVideo = {
  title: "Latest from Vansun",
  youtubeId: undefined,
  thumbnailLocal: "blog-latest-video.jpg",
};
