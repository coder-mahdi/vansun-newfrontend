import Image from "next/image";
import Link from "next/link";

import {
  homeAboutBody,
  homeAboutImageUrl,
  homeAboutTitle,
} from "@/data/home-about";
import { cn } from "@/lib/helpers";

export function AboutUsSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("about-us-section", className)}
      aria-labelledby="home-about-title"
    >
      <div className="about-container">
        <div className="about-image">
          <Image
            src={homeAboutImageUrl}
            alt="Vansun Studio"
            fill
            className="about-image__img"
            sizes="(min-width: 1023px) 50vw, 100vw"
            priority={false}
          />
        </div>
        <div className="about-text">
          <h2 id="home-about-title" className="about-title">
            {homeAboutTitle}
          </h2>
          <p className="about-body">{homeAboutBody}</p>
          <Link href="/about" className="about-more">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
