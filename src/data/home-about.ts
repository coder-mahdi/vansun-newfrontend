import { isLiveContentMode } from "@/lib/content-mode";

/** Same asset as About page studio (`public/images/Shop/salon.png`). */
export const homeAboutSalonImageUrl = "/images/Shop/salon.png";

/** Live CMS: set when wiring a featured image from API. */
const cmsAboutImage: string | null = null;

export const homeAboutImageUrl =
  isLiveContentMode() && cmsAboutImage
    ? cmsAboutImage
    : homeAboutSalonImageUrl;

export const homeAboutTitle = "Vansun Studio";

export const homeAboutBody =
  "Vansun Studio was founded by Masi Aghdam, a multidisciplinary artist with a background in communications and a passion for body art, photography, and creative expression. She has spent years capturing nature and social events across Africa and Europe, and brings that artistic eye into every piercing and tattoo she creates. After gaining experience in Vancouver’s tattoo and piercing scene, she opened Vansun Studio on vibrant Granville Street, a clean, professional, and welcoming space run by a team of experienced artists.";
