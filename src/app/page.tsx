import { AboutUsSection } from "@/components/home/AboutUsSection";
import { FeaturedBlogsSection } from "@/components/home/FeaturedBlogsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { MyWorkSection } from "@/components/home/MyWorkSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MyWorkSection />
      <AboutUsSection />
      <FeaturedBlogsSection />
    </>
  );
}
