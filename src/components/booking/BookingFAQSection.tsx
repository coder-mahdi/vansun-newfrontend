import { cn } from "@/lib/helpers";
import { fetchBookingFaqs } from "@/lib/faq-api";
import type { BookingFaqService } from "@/lib/faq-api";
import { BookingFaqAccordion } from "./BookingFaqAccordion";

type BookingFAQSectionProps = {
  service: BookingFaqService;
  className?: string;
  title?: string;
};

export async function BookingFAQSection({
  service,
  className,
  title,
}: BookingFAQSectionProps) {
  const items = await fetchBookingFaqs(service);
  const headingTitle =
    title ?? (service === "piercing" ? "Frequently Asked Questions" : "FAQ");

  return (
    <section
      className={cn("booking-faq-section", className)}
      aria-labelledby="booking-faq-heading"
    >
      <BookingFaqAccordion items={items} title={headingTitle} />
    </section>
  );
}
