import type { MetadataRoute } from "next";
import { fetchBlogSummaries } from "@/lib/blog-api";
import { blogPostHref } from "@/lib/blog-routes";

function publicSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://vansunstudio.com"
  ).replace(/\/$/, "");
}

/** Indexable marketing routes (exclude paths blocked in robots.txt). */
const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/blogs", changeFrequency: "weekly", priority: 0.85 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.85 },
  { path: "/gallery/tattoo", changeFrequency: "monthly", priority: 0.8 },
  { path: "/gallery/piercing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/gallery/jewelry", changeFrequency: "monthly", priority: 0.8 },
  { path: "/book/tattoo", changeFrequency: "monthly", priority: 0.85 },
  { path: "/book/piercing", changeFrequency: "monthly", priority: 0.85 },
  { path: "/piercing/price-list", changeFrequency: "monthly", priority: 0.75 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicSiteOrigin();
  const summaries = await fetchBlogSummaries();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${origin}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })
  );

  const blogEntries: MetadataRoute.Sitemap = summaries.map((s) => ({
    url: `${origin}${blogPostHref(s.slug)}`,
    lastModified: new Date(s.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...blogEntries];
}
