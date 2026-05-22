import type { Metadata } from "next";

import { BlogsPageClient } from "@/components/blogs/BlogsPageClient";
import { fetchBlogSummaries, fetchBlogVideos } from "@/lib/blog-api";

export const metadata: Metadata = {
  title: "Vansun Blog",
  description:
    "Articles from Vansun: tattoo, piercing, aftercare, and studio updates.",
};

/** Always hit CMS at request time (env + `/content/blogs` can change; avoids stale static shell). */
export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  // No topic filter — full list from CMS (see fetchBlogSummaries in blog-api).
  const [blogs, videos] = await Promise.all([
    fetchBlogSummaries(),
    fetchBlogVideos(),
  ]);

  console.log("[blogs page] length:", blogs.length);
  console.log("[blogs page] blogs:", blogs);

  // Render path: BlogsPageClient → filteredPosts → BlogGrid → posts.map → <BlogCard />
  return <BlogsPageClient posts={blogs} videos={videos} />;
}
