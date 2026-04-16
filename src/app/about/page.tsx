import type { Metadata } from "next";

import { AboutHero } from "@/components/about/AboutHero";
import { AboutStudioSections } from "@/components/about/AboutStudioSections";
import { BookingNoticeSection } from "@/components/about/BookingNoticeSection";
import { PiercerSection } from "@/components/about/PiercerSection";
import { fetchGooglePlaceReviewsSorted } from "@/lib/google-place-reviews";

export const metadata: Metadata = {
  title: "About",
  description:
    "Vansun Studio on Granville Street: Vancouver Coastal Health standards, hygiene, jewelry quality, and piercing room.",
};

export default async function AboutPage() {
  const googlePlaceReviews = await fetchGooglePlaceReviewsSorted();

  return (
    <>
      <AboutHero />
      <AboutStudioSections />
      <PiercerSection googlePlaceReviews={googlePlaceReviews} />
      <BookingNoticeSection />
    </>
  );
}
