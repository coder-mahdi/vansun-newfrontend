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
import { fetchJewelryGalleryItems } from "@/lib/gallery-api";

export default async function GalleryJewelryPage() {
  const [items, posts, videos] = await Promise.all([
    fetchJewelryGalleryItems(),
    fetchBlogSummaries(),
    fetchBlogVideos(),
  ]);
  const latestVideo = pickLatestBlogVideo(videos);

  return (
    <>
      <GalleryHeader title="Jewelry gallery" intro={galleryPageIntro.jewelry} />
      <GalleryTypeSelector />
      <GalleryGrid items={items} category="jewelry" />
      <FeaturedBlogsSection
        posts={posts}
        latestVideo={latestVideo}
        className="gallery-page__featured"
      />
    </>
  );
}
