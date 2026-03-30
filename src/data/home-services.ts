import { devCmsAsset } from "@/lib/content-assets";

export type HomeService = {
  title: string;
  description: string;
  /** File in `public/dev-cms/` (mock); swap to CMS URL when live. */
  imageUrl: string;
  imageAlt: string;
  bookLabel: string;
  bookHref: string;
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
  },
  {
    title: "Piercing",
    description:
      "Safe, precise piercing with jewelry options to match your style.",
    imageUrl: devCmsAsset("service-piercing.jpg"),
    imageAlt: "Piercing at Vansun Studio",
    bookLabel: "Book piercing",
    bookHref: "/book/piercing",
  },
];
