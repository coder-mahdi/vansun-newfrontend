import { BookingFAQSection } from "@/components/booking/BookingFAQSection";
import { TattooBookingForm } from "@/components/booking/TattooBookingForm";
import { TattooReferenceStripSection } from "@/components/booking/TattooReferenceStripSection";

export default function BookTattooPage() {
  return (
    <>
      <h1 className="sr-only">Book tattoo</h1>
      <TattooReferenceStripSection />
      <TattooBookingForm />
      <BookingFAQSection />
    </>
  );
}
