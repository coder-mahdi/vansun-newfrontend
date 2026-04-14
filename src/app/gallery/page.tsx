import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryTypeSelector } from "@/components/gallery/GalleryTypeSelector";
import { FeaturedBlogsSection } from "@/components/home/FeaturedBlogsSection";
import { galleryPageIntro } from "@/data/gallery-page-intros";
import {
  fetchBlogSummaries,
  fetchBlogVideos,
  pickLatestBlogVideo,
} from "@/lib/blog-api";
import { fetchGalleryItems } from "@/lib/gallery-api";

export default async function GalleryPage() {
  const [items, posts, videos] = await Promise.all([
    fetchGalleryItems(),
    fetchBlogSummaries(),
    fetchBlogVideos(),
  ]);
  const latestVideo = pickLatestBlogVideo(videos);

  return (
    <>
      <GalleryHeader title="Gallery" intro={galleryPageIntro.all} />
      <GalleryTypeSelector />
      <GalleryGrid items={items} />
      <FeaturedBlogsSection
        posts={posts}
        latestVideo={latestVideo}
        className="gallery-page__featured"
      />
    </>
  );
}
