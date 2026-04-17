export type GalleryCategory = "piercing" | "tattoo" | "jewelry";

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  imageSrc: string;
  imageAlt: string;
  /** From WordPress `show_title`; caption only when `true` (default off in CMS). */
  showTitle?: boolean;
  /** Second line under title (e.g. jewelry store tier price). */
  priceLabel?: string;
};
