import Link from "next/link";

import { BookingFAQSection } from "@/components/booking/BookingFAQSection";
import { BookingRelatedContent } from "@/components/booking/BookingRelatedContent";
import { JewelryStripSection } from "@/components/booking/JewelryStripSection";
import { PiercingBookingForm } from "@/components/booking/PiercingBookingForm";

export const revalidate = 300;

export default function BookPiercingPage() {
  return (
    <>
      <JewelryStripSection />
      <div className="booking-page-container">
        <div className="booking-container">
          <h1 className="booking-page__title">Book piercing</h1>
          <nav
            className="piercing-book-page__quick-nav"
            aria-label="Piercing quick links"
          >
            <Link href="/piercing/price-list">Piercing price list</Link>
          </nav>
          <PiercingBookingForm />
        </div>
      </div>
      <BookingFAQSection service="piercing" />
      <BookingRelatedContent preferCategory="piercing" />
    </>
  );
}
