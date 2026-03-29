import { AboutHero } from "@/components/about/AboutHero";
import { ArtistSection } from "@/components/about/ArtistSection";
import { StudioStorySection } from "@/components/about/StudioStorySection";
import { StudioValuesSection } from "@/components/about/StudioValuesSection";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StudioStorySection />
      <ArtistSection />
      <StudioValuesSection />
    </>
  );
}
