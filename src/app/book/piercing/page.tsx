import { BookingFAQSection } from "@/components/booking/BookingFAQSection";
import { JewelryStripSection } from "@/components/booking/JewelryStripSection";
import { PiercingBookingForm } from "@/components/booking/PiercingBookingForm";

export default function BookPiercingPage() {
  return (
    <>
      <JewelryStripSection />
      <div className="booking-page-container">
        <div className="booking-container">
          <h1 className="booking-page__title">Book piercing</h1>
          <PiercingBookingForm />
        </div>
      </div>
      <BookingFAQSection />
    </>
  );
}
