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
import type { GooglePlaceReview } from "@/lib/google-place-reviews";
import { cn } from "@/lib/helpers";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[parts.length - 1]?.[0];
    if (a && b) return (a + b).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

function StarRow({ rating }: { rating: number }) {
  const r = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span className="piercer-section__stars" aria-label={`${r} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden>
          {i < r ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export type PiercerSectionProps = {
  className?: string;
  /** When non-empty (Places API configured), shown instead of local testimonials. */
  googlePlaceReviews?: GooglePlaceReview[];
};

export function PiercerSection({
  className,
  googlePlaceReviews = [],
}: PiercerSectionProps) {
  const useGoogle = googlePlaceReviews.length > 0;
  const linkIsExternal = googleReviewsUrl.startsWith("http");

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
            {useGoogle
              ? googlePlaceReviews.map((r, idx) => (
                  <li key={`g-${r.authorName}-${idx}`} className="piercer-section__card">
                    <div
                      className="piercer-section__avatar-wrap piercer-section__avatar-wrap--initials"
                      aria-hidden
                    >
                      <span className="piercer-section__avatar-initials">
                        {initialsFromName(r.authorName)}
                      </span>
                    </div>
                    <blockquote className="piercer-section__quote">
                      <StarRow rating={r.rating} />
                      <p>&ldquo;{r.text}&rdquo;</p>
                      <footer className="piercer-section__cite">
                        {r.authorName}
                        {r.relativeTimeDescription ? (
                          <span className="piercer-section__review-time">
                            {" "}
                            · {r.relativeTimeDescription}
                          </span>
                        ) : null}
                      </footer>
                    </blockquote>
                  </li>
                ))
              : aboutTestimonials.map((t) => (
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
              {...(linkIsExternal
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
