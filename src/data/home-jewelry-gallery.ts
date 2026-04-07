import { devCmsAsset } from "@/lib/content-assets";

export const jewelryGalleryTitle = "Jewelry gallery";

export const jewelryGalleryIntro =
  "Every piece we use and sell is implant-grade titanium, safe for healing, durable, and nickel-free.";

export type JewelryGallerySlide = {
  source_url: string;
  alt: string;
};

/** Add `jewelry-gallery-1.jpg` … `jewelry-gallery-4.jpg` under `public/dev-cms/`. */
export function getJewelryGallerySlides(): JewelryGallerySlide[] {
  return [1, 2, 3, 4].map((n) => ({
    source_url: devCmsAsset(`jewelry-gallery-${n}.jpg`),
    alt: `Jewelry gallery image ${n}`,
  }));
}
