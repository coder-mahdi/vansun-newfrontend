import Image from "next/image";
import Link from "next/link";

import {
  aboutTestimonials,
  googleReviewsLinkLabel,
  googleReviewsUrl,
  piercerSectionBody,
  piercerSectionTitle,
  testimonialImageUrl,
} from "@/data/about-page";
import { cn } from "@/lib/helpers";

export function PiercerSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("piercer-section", className)}
      aria-labelledby="piercer-heading"
    >
      <div className="piercer-section__inner">
        <div className="piercer-section__copy">
          <h2 id="piercer-heading" className="piercer-section__title">
            {piercerSectionTitle}
          </h2>
          {piercerSectionBody.map((p, i) => (
            <p key={`piercer-body-${i}`} className="piercer-section__body">
              {p}
            </p>
          ))}
        </div>
        <div className="piercer-section__aside">
          <ul className="piercer-section__testimonials">
            {aboutTestimonials.map((t) => (
              <li key={t.id} className="piercer-section__card">
                <div className="piercer-section__avatar-wrap">
                  <Image
                    src={testimonialImageUrl(t)}
                    alt=""
                    width={72}
                    height={72}
                    className="piercer-section__avatar"
                  />
                </div>
                <blockquote className="piercer-section__quote">
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <footer className="piercer-section__cite">{t.name}</footer>
                </blockquote>
              </li>
            ))}
          </ul>
          <p className="piercer-section__reviews">
            <Link
              href={googleReviewsUrl}
              className="piercer-section__reviews-link"
              {...(googleReviewsUrl.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {googleReviewsLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
