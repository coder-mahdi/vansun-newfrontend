import {
  bookingNoticeBody,
  bookingNoticeTitle,
} from "@/data/about-page";
import { cn } from "@/lib/helpers";

export function BookingNoticeSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("booking-notice-section", className)}
      aria-labelledby="booking-notice-heading"
    >
      <div className="booking-notice-section__inner">
        <h2 id="booking-notice-heading" className="booking-notice-section__title">
          {bookingNoticeTitle}
        </h2>
        {bookingNoticeBody.map((p, i) => (
          <p key={`booking-notice-${i}`} className="booking-notice-section__body">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
