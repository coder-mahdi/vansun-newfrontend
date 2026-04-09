import { devCmsAsset } from "@/lib/content-assets";

import type { BlogPost, BlogSummary, BlogVideo, FeaturedLatestVideo } from "@/types/blog";

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
    category: "tattoo",
    keyword: "studio",
    coverFile: "blog-cover-welcome.jpg",
  },
  {
    slug: "aftercare-essentials",
    title: "Aftercare essentials for tattoos and piercings",
    excerpt:
      "Simple daily habits that help healing and keep colour and jewellery looking their best.",
    publishedAt: "2026-03-15",
    category: "piercing",
    keyword: "aftercare",
    coverFile: "blog-cover-aftercare.jpg",
  },
  {
    slug: "choosing-your-first-tattoo",
    title: "Choosing your first tattoo",
    excerpt:
      "Placement, size, and style tips so your first piece feels right for years to come.",
    publishedAt: "2026-02-20",
    category: "tattoo",
    keyword: "first tattoo",
    coverFile: "blog-cover-first-tattoo.jpg",
  },
  {
    slug: "piercing-jewelry-guide",
    title: "A short guide to piercing jewellery",
    excerpt:
      "Materials, gauges, and what we recommend for initial vs healed piercings.",
    publishedAt: "2026-01-10",
    category: "piercing",
    keyword: "jewelry",
    coverFile: "blog-cover-jewelry.jpg",
  },
  {
    slug: "granville-street-studio",
    title: "Life on Granville Street",
    excerpt:
      "Why we chose this neighbourhood and how to find us when you visit downtown Vancouver.",
    publishedAt: "2025-12-05",
    category: "tattoo",
    keyword: "vancouver",
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
      content: `<p>${s.excerpt}</p><p>Full article body will load from the API when <code>NEXT_PUBLIC_API_URL</code> is configured.</p>`,
    },
  ])
);

/** Mock video list when GET /blog-videos is unavailable (newest first). */
export const mockBlogVideos: BlogVideo[] = [
  {
    id: "mv-1",
    title: "Studio tour: piercing setup",
    excerpt: "A walkthrough of how we prep the room and sterilize jewellery before your appointment.",
    keyword: "piercing",
    youtubeId: "jNQXAC9IVRw",
    category: "piercing",
    publishedAt: "2026-03-20",
  },
  {
    id: "mv-2",
    title: "Tattoo healing week one",
    excerpt: "What to expect in the first seven days and what to avoid while your piece settles.",
    keyword: "aftercare",
    youtubeId: "dQw4w9WgXcQ",
    category: "tattoo",
    publishedAt: "2026-03-18",
  },
  {
    id: "mv-3",
    title: "Choosing safe jewellery",
    excerpt: "Materials we trust for initial piercings and why it matters for healing.",
    keyword: "jewelry",
    youtubeId: "jNQXAC9IVRw",
    category: "piercing",
    publishedAt: "2026-02-01",
  },
  {
    id: "mv-4",
    title: "Before your first tattoo",
    excerpt: "Sleep, food, and ID: quick tips so your session starts smoothly.",
    keyword: "first tattoo",
    youtubeId: "dQw4w9WgXcQ",
    category: "tattoo",
    publishedAt: "2026-01-25",
  },
  {
    id: "mv-5",
    title: "Aftercare FAQ",
    excerpt: "Answers to the questions we hear most about showers, sports, and sun.",
    keyword: "faq",
    youtubeId: "jNQXAC9IVRw",
    category: "tattoo",
    publishedAt: "2025-12-10",
  },
  {
    id: "mv-6",
    title: "Downtown Vancouver visit",
    excerpt: "Parking, transit, and how to find our door on Granville.",
    keyword: "vancouver",
    youtubeId: "dQw4w9WgXcQ",
    category: "tattoo",
    publishedAt: "2025-11-05",
  },
];

/** Home “latest video” block; set `youtubeId` when you have a real upload. */
export const featuredLatestVideo: FeaturedLatestVideo = {
  title: "Latest from Vansun",
  youtubeId: undefined,
  thumbnailLocal: "blog-latest-video.jpg",
};
