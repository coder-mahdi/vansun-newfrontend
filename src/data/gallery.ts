import type { GalleryItem } from "@/types/gallery";

/** Dev fallback when CMS/API returns no rows; uses files already in `public/`. */
const pierceImg = {
  ear: "/images/piercings/ear.webp",
  lips: "/images/piercings/lips.webp",
  face: "/images/piercings/face-body.webp",
} as const;

export const galleryItems: GalleryItem[] = [
  {
    id: "tattoo-1",
    title: "Tattoo work sample",
    category: "tattoo",
    imageSrc: pierceImg.ear,
    imageAlt: "Gallery sample — tattoo",
  },
  {
    id: "tattoo-2",
    title: "Tattoo work sample",
    category: "tattoo",
    imageSrc: pierceImg.lips,
    imageAlt: "Gallery sample — tattoo",
  },
  {
    id: "tattoo-3",
    title: "Tattoo work sample",
    category: "tattoo",
    imageSrc: pierceImg.face,
    imageAlt: "Gallery sample — tattoo",
  },
  {
    id: "piercing-1",
    title: "Piercing work sample",
    category: "piercing",
    imageSrc: pierceImg.ear,
    imageAlt: "Gallery sample — piercing",
  },
  {
    id: "piercing-2",
    title: "Piercing work sample",
    category: "piercing",
    imageSrc: pierceImg.lips,
    imageAlt: "Gallery sample — piercing",
  },
  {
    id: "piercing-3",
    title: "Piercing work sample",
    category: "piercing",
    imageSrc: pierceImg.face,
    imageAlt: "Gallery sample — piercing",
  },
  {
    id: "jewelry-1",
    title: "Jewelry styling sample",
    category: "jewelry",
    imageSrc: pierceImg.ear,
    imageAlt: "Gallery sample — jewelry",
  },
  {
    id: "jewelry-2",
    title: "Jewelry styling sample",
    category: "jewelry",
    imageSrc: pierceImg.lips,
    imageAlt: "Gallery sample — jewelry",
  },
  {
    id: "jewelry-3",
    title: "Jewelry styling sample",
    category: "jewelry",
    imageSrc: pierceImg.face,
    imageAlt: "Gallery sample — jewelry",
  },
];
