import { devCmsAsset } from "@/lib/content-assets";

export type HomeServiceGalleryLink = {
  label: string;
  href: string;
};

export type HomeService = {
  title: string;
  description: string;
  /** File in `public/dev-cms/` (mock); swap to CMS URL when live. */
  imageUrl: string;
  imageAlt: string;
  bookLabel: string;
  bookHref: string;
  /** Secondary CTAs (e.g. gallery pages). */
  galleryLinks?: HomeServiceGalleryLink[];
};

export const homeServices: HomeService[] = [
  {
    title: "Tattoo",
    description:
      "Custom tattoo work tailored to your story. Browse the gallery and book a consultation.",
    imageUrl: devCmsAsset("service-tattoo.jpg"),
    imageAlt: "Tattoo work at Vansun Studio",
    bookLabel: "Book tattoo",
    bookHref: "/book/tattoo",
    galleryLinks: [{ label: "Tattoo gallery", href: "/gallery/tattoo" }],
  },
  {
    title: "Piercing",
    description:
      "Safe, precise piercing with jewelry options to match your style.",
    imageUrl: devCmsAsset("service-piercing.jpg"),
    imageAlt: "Piercing at Vansun Studio",
    bookLabel: "Book piercing",
    bookHref: "/book/piercing",
    galleryLinks: [
      { label: "Piercing gallery", href: "/gallery/piercing" },
      { label: "Jewelry gallery", href: "/gallery/jewelry" },
    ],
  },
];
