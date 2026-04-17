import { contentImageUrl } from "@/lib/content-assets";
import { isLiveContentMode } from "@/lib/content-mode";

/** Live CMS: pass real URLs from API when wiring content. */
const cms = {
  heroImage: null as string | null,
  testimonials: [null, null, null] as (string | null)[],
};

/** Public shop photos (`public/images/Shop/`, WebP). */
export const aboutShopImagePaths = {
  location: "/images/Shop/location.webp",
  salon: "/images/Shop/salon.webp",
  tools: "/images/Shop/tools.webp",
  masi: "/images/Shop/Masi.webp",
  masi2: "/images/Shop/Masi2.webp",
  piercingRoom: `/images/Shop/${encodeURIComponent("piercing room.webp")}`,
} as const;

export const aboutPageHeroTitle = "Vansun Studio";

export const aboutPageHeroIntro = [
  "Vansun Studio was founded by Masi Aghdam, a multidisciplinary artist with a background in communications and a passion for body art, photography, and creative expression. She has spent years capturing nature and social events across Africa and Europe, and brings that artistic eye into every piercing and tattoo she creates. After gaining experience in Vancouver’s tattoo and piercing scene, she opened Vansun Studio on vibrant Granville Street: a clean, professional, and welcoming space run by a team of experienced artists.",
];

/** Hero portraits: Masi + Masi2 in `public/images/Shop/*.webp`. Live CMS can override with a single hero image URL. */
export const aboutPageHeroImageUrls: string[] =
  isLiveContentMode() && cms.heroImage
    ? [cms.heroImage]
    : [aboutShopImagePaths.masi, aboutShopImagePaths.masi2];

export type AboutStudioBlock = {
  id: string;
  tone: "light" | "dark";
  title: string;
  paragraphs: string[];
  /** Optional ordered steps (e.g. sterilization). */
  listItems?: string[];
  listIntro?: string;
  paragraphsAfterList?: string[];
  image?: { src: string; alt: string };
  /** Where the image sits on large screens. */
  imageSide?: "left" | "right";
  /** Full-width image row above copy (piercing room). */
  layout?: "split" | "stack";
};

export const aboutStudioBlocks: AboutStudioBlock[] = [
  {
    id: "location",
    tone: "light",
    title: "Location",
    imageSide: "right",
    image: {
      src: aboutShopImagePaths.location,
      alt: "Vansun Studio on Granville Street, Vancouver",
    },
    paragraphs: [
      "Our studio is located in the heart of Vancouver, right on the iconic Granville Street, one of the city’s most vibrant and historic areas. Surrounded by shops, restaurants, and entertainment, the location offers a lively and unique atmosphere.",
      "We are highly accessible, with a bus stop just steps away and only a short walking distance from nearby SkyTrain stations, making it easy to reach us from anywhere in the city.",
    ],
  },
  {
    id: "studio-environment",
    tone: "dark",
    title: "Our studio environment",
    imageSide: "left",
    image: {
      src: aboutShopImagePaths.salon,
      alt: "Vansun Studio interior, reception and work area",
    },
    paragraphs: [
      "Our studio is designed to meet all Vancouver Coastal Health standards for both tattoo and piercing services. We maintain a clean, professional, and welcoming environment where your safety and comfort are our top priorities.",
    ],
  },
  {
    id: "hygiene-safety",
    tone: "light",
    title: "Hygiene & safety standards",
    imageSide: "right",
    image: {
      src: aboutShopImagePaths.tools,
      alt: "Sterilized tools and professional piercing equipment",
    },
    paragraphs: [
      "We strictly follow all health regulations set by British Columbia and Vancouver Coastal Health.",
      "All stations and chairs are prepared for each client using single-use disposable covers. Every tool and piece of equipment is fully sterilized before use.",
    ],
    listIntro: "Our sterilization process includes multiple steps to ensure the highest level of safety:",
    listItems: [
      "All jewelry and tools are first cleaned and dried using an ultrasonic cleaning device.",
      "They are then placed in sterilization pouches and sealed.",
      "Finally, they are sterilized in a modern autoclave using high-pressure steam at high temperatures to eliminate all microorganisms.",
    ],
    paragraphsAfterList: [
      "This final sterilization step is typically completed after the client selects their jewelry, ensuring maximum hygiene and safety.",
      "All needles and other consumable items are strictly single-use and disposed of after each procedure.",
    ],
  },
];

/** Jewelry block (text-only); inserted after hygiene in the page component. */
export const aboutJewelryBlock = {
  id: "jewelry-quality",
  tone: "dark" as const,
  title: "Jewelry quality",
  paragraphs: [
    "We only use high-quality implant-grade titanium jewelry, which is considered the safest and most suitable material for the healing process.",
    "For pieces that include gemstones, we use Cubic Zirconia, offering both safety and a clean, elegant look.",
  ],
};

export const aboutPiercingRoomBlock: AboutStudioBlock = {
  id: "piercing-room",
  tone: "light",
  title: "Piercing room",
  layout: "stack",
  image: {
    src: aboutShopImagePaths.piercingRoom,
    alt: "Dedicated piercing room at Vansun Studio",
  },
  paragraphs: [
    "Our piercing room is completely separate from the tattoo area, providing a dedicated, clean, and controlled environment specifically designed for piercing procedures.",
    "The space is maintained to the highest hygiene standards in line with Vancouver Coastal Health guidelines. All equipment is properly sterilized, and the room is kept organized, minimal, and professional at all times.",
    "To ensure a calm, safe, and respectful experience for every client, photography and video recording are not permitted inside the piercing room. This is part of our studio policy and helps maintain privacy, focus, and a stress-free environment during the procedure.",
    "Our goal is to provide not only a safe experience, but also a comfortable and relaxing atmosphere where clients feel fully at ease.",
  ],
};

export const piercerSectionTitle = "Your piercer";

export const piercerSectionBody = [
  "Our piercer brings years of hands-on experience and ongoing training. You’ll get clear guidance on placement, jewelry options, and healing, never rushed, always professional.",
  "We’ve worked with every kind of client and anatomy, from first-time piercings to advanced projects. The goal is always the same: safe procedure, beautiful result, and honest aftercare advice.",
];

export type AboutTestimonial = {
  id: string;
  quote: string;
  name: string;
  /** Local dev file in `public/dev-cms/`; live: pass CMS avatar URL. */
  localImage: string;
  cmsImage?: string | null;
};

export const aboutTestimonials: AboutTestimonial[] = [
  {
    id: "1",
    quote:
      "Super calm environment and everything felt spotless. They walked me through aftercare without making me feel silly for asking questions.",
    name: "Alex M.",
    localImage: "testimonial-1.jpg",
    cmsImage: cms.testimonials[0],
  },
  {
    id: "2",
    quote:
      "Best piercing experience I’ve had in Vancouver. Clear communication and the room looked like a medical-grade setup, in a good way.",
    name: "Jordan K.",
    localImage: "testimonial-2.jpg",
    cmsImage: cms.testimonials[1],
  },
  {
    id: "3",
    quote:
      "I appreciated how thorough they were with sterilization and jewelry choices. I’ll be back for my next one.",
    name: "Sam R.",
    localImage: "testimonial-3.jpg",
    cmsImage: cms.testimonials[2],
  },
];

export function testimonialImageUrl(t: AboutTestimonial): string {
  return contentImageUrl(t.localImage, t.cmsImage);
}

/** Stable Google search for studio reviews (no session tokens). */
export const googleReviewsDefaultSearchUrl =
  "https://www.google.com/search?" +
  new URLSearchParams({
    q: "Vansunstudio - Downtown Vancouver | Piercing & Tattoo Reviews",
  }).toString();

/**
 * Public “Read more on Google” target. Override with `NEXT_PUBLIC_GOOGLE_REVIEWS_URL`
 * (e.g. Maps place URL) if you prefer.
 */
export const googleReviewsUrl =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL?.trim() ||
  googleReviewsDefaultSearchUrl;

export const googleReviewsLinkLabel = "Read more on Google";

export const bookingNoticeTitle = "Walk-ins & appointments";

export const bookingNoticeBody = [
  "Walk-ins are welcome when we have availability, but booking ahead is always the easiest way to secure your time.",
  "Whenever you visit, especially with a booking, please plan for a short wait of a few minutes while we set up your station and run sterilization for tools and jewelry. We never rush this step; it’s part of keeping everyone safe.",
];
