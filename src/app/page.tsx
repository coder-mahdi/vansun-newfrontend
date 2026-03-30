import { AboutUsSection } from "@/components/home/AboutUsSection";
import { FeaturedBlogsSection } from "@/components/home/FeaturedBlogsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { JewelryGallerySection } from "@/components/home/JewelryGallerySection";
import { ServicesSection } from "@/components/home/ServicesSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <JewelryGallerySection />
      <AboutUsSection />
      <FeaturedBlogsSection />
    </>
  );
}
