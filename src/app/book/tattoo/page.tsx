import { BookingFAQSection } from "@/components/booking/BookingFAQSection";
import { BookingRelatedContent } from "@/components/booking/BookingRelatedContent";
import { TattooBookingForm } from "@/components/booking/TattooBookingForm";
import { TattooReferenceStripSection } from "@/components/booking/TattooReferenceStripSection";

export const revalidate = 300;

export default function BookTattooPage() {
  return (
    <>
      <TattooReferenceStripSection />
      <div className="booking-page-container">
        <div className="booking-container">
          <h1 className="booking-page__title">Book tattoo</h1>
          <TattooBookingForm />
        </div>
      </div>
      <BookingFAQSection service="tattoo" />
      <BookingRelatedContent preferCategory="tattoo" />
    </>
  );
}
