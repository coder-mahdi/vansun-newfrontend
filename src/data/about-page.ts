import { contentImageUrl } from "@/lib/content-assets";

/** Live CMS: pass real URLs from API when wiring content. */
const cms = {
  heroImage: null as string | null,
  piercingRoom: [null, null, null, null] as (string | null)[],
  testimonials: [null, null, null] as (string | null)[],
};

export const aboutPageHeroTitle = "Vansu Studio";

export const aboutPageHeroIntro = [
  "We are a dedicated piercing and tattoo studio focused on safety, precision, and a calm, welcoming space for every client.",
  "From jewelry selection to aftercare, we take the time to explain every step so you always know what to expect.",
];

export const aboutPageHeroImageUrl = contentImageUrl(
  "about-page-hero.jpg",
  cms.heroImage
);

export const piercingRoomTitle = "Piercing Room";

export const piercingRoomBody = [
  "Every piece of jewelry is sterilized before it touches your skin. Our tools, surfaces, and workflow follow strict hygiene standards so you can relax and focus on your new piercing.",
  "The room is set up for a fully modern, spotless environment. We use professional sterilization equipment and keep everything organized and easy to sanitize between appointments.",
  "Our studio meets Vancouver Coastal Health requirements and we’re proud to maintain a space that feels as clean as it is comfortable.",
];

export const piercingRoomImageUrls = [
  contentImageUrl("piercing-room-1.jpg", cms.piercingRoom[0]),
  contentImageUrl("piercing-room-2.jpg", cms.piercingRoom[1]),
  contentImageUrl("piercing-room-3.jpg", cms.piercingRoom[2]),
  contentImageUrl("piercing-room-4.jpg", cms.piercingRoom[3]),
];

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

/**
 * Set `NEXT_PUBLIC_GOOGLE_REVIEWS_URL` to your Google Business review link.
 * Falls back to a safe placeholder until configured.
 */
export const googleReviewsUrl =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL?.trim() || "#google-reviews";

export const googleReviewsLinkLabel = "Read all reviews on Google";

export const bookingNoticeTitle = "Walk-ins & appointments";

export const bookingNoticeBody = [
  "Walk-ins are welcome when we have availability, but booking ahead is always the easiest way to secure your time.",
  "Whenever you visit, especially with a booking, please plan for a short wait of a few minutes while we set up your station and run sterilization for tools and jewelry. We never rush this step; it’s part of keeping everyone safe.",
];
