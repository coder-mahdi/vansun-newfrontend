export type GalleryCategory = "piercing" | "tattoo";

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  imageSrc: string;
  imageAlt: string;
};
