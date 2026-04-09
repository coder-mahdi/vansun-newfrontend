import { AboutUsSection } from "@/components/home/AboutUsSection";
import { FeaturedBlogsSection } from "@/components/home/FeaturedBlogsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { JewelryGallerySection } from "@/components/home/JewelryGallerySection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { fetchBlogSummaries } from "@/lib/blog-api";
import { loadHomePageContent } from "@/lib/home-cms";

/** Always run CMS fetch at request time (avoids stale static HTML vs curl). */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [blogPosts, home] = await Promise.all([
    fetchBlogSummaries(),
    loadHomePageContent(),
  ]);

  return (
    <>
      <HeroSection hero={home.hero} />
      <ServicesSection serviceImages={home.serviceImages} />
      <JewelryGallerySection
        title={home.jewelry.title}
        intro={home.jewelry.intro}
        slides={home.jewelry.slides}
      />
      <AboutUsSection
        title={home.about.title}
        body={home.about.body}
        imageUrl={home.about.imageUrl}
        imageAlt={home.about.title}
      />
      <FeaturedBlogsSection posts={blogPosts} />
    </>
  );
}
