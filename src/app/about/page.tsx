import type { Metadata } from "next";

import { AboutHero } from "@/components/about/AboutHero";
import { BookingNoticeSection } from "@/components/about/BookingNoticeSection";
import { PiercerSection } from "@/components/about/PiercerSection";
import { PiercingRoomSection } from "@/components/about/PiercingRoomSection";

export const metadata: Metadata = {
  title: "About",
  description:
    "Vansu Studio: piercing room, experienced piercer, sterilization standards, and booking information.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <PiercingRoomSection />
      <PiercerSection />
      <BookingNoticeSection />
    </>
  );
}
