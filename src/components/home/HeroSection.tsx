import type { HomeHeroPayload } from "@/lib/home-cms";

import { HeroSlider } from "./HeroSlider";

export function HeroSection({
  className,
  hero,
}: {
  className?: string;
  hero: HomeHeroPayload;
}) {
  return <HeroSlider className={className} hero={hero} />;
}
