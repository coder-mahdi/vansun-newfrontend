import { devCmsAsset } from "@/lib/content-assets";

import type { WpMedia } from "@/lib/cms-wordpress";

export const MOCK_HERO_TITLE = "Vansun Studio";
export const MOCK_HERO_SUBTITLE = "Tattoo & piercing";

/** Add `hero-1.jpg`, `hero-2.jpg` under `public/dev-cms/` for the mock slider. */
export function getMockHeroImages(): WpMedia[] {
  return [
    { source_url: devCmsAsset("hero-1.jpg"), alt_text: "" },
    { source_url: devCmsAsset("hero-2.jpg"), alt_text: "" },
  ];
}
