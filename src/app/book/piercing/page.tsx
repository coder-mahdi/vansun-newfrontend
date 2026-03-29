import { BookingFAQSection } from "@/components/booking/BookingFAQSection";
import { JewelryStripSection } from "@/components/booking/JewelryStripSection";
import { PiercingBookingForm } from "@/components/booking/PiercingBookingForm";

export default function BookPiercingPage() {
  return (
    <>
      <h1 className="sr-only">Book piercing</h1>
      <JewelryStripSection />
      <PiercingBookingForm />
      <BookingFAQSection />
    </>
  );
}
