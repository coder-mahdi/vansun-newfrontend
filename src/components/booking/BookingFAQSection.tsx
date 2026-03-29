import { bookingFaqs } from "@/data/faqs";
import { Accordion } from "@/components/ui/Accordion";

export function BookingFAQSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="booking-faq-heading">
      <h2 id="booking-faq-heading">FAQ</h2>
      <Accordion
        items={bookingFaqs.map((f) => ({
          id: f.id,
          title: f.question,
          content: f.answer,
        }))}
      />
    </section>
  );
}
