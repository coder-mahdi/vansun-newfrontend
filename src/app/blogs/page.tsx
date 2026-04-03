import type { Metadata } from "next";

import { BlogsPageClient } from "@/components/blogs/BlogsPageClient";
import { fetchBlogSummaries, fetchBlogVideos } from "@/lib/blog-api";

export const metadata: Metadata = {
  title: "Vansun Blog",
  description:
    "Articles and videos from Vansun — tattoo, piercing, aftercare, and studio updates.",
};

export default async function BlogsPage() {
  const [posts, videos] = await Promise.all([
    fetchBlogSummaries(),
    fetchBlogVideos(),
  ]);

  return <BlogsPageClient posts={posts} videos={videos} />;
}
