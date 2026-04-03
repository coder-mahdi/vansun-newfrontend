import { AboutUsSection } from "@/components/home/AboutUsSection";
import { FeaturedBlogsSection } from "@/components/home/FeaturedBlogsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { JewelryGallerySection } from "@/components/home/JewelryGallerySection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { fetchBlogSummaries } from "@/lib/blog-api";

export default async function HomePage() {
  const blogPosts = await fetchBlogSummaries();

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <JewelryGallerySection />
      <AboutUsSection />
      <FeaturedBlogsSection posts={blogPosts} />
    </>
  );
}
