import Image from "next/image";

import {
  aboutPageHeroImageUrl,
  aboutPageHeroIntro,
  aboutPageHeroTitle,
} from "@/data/about-page";
import { cn } from "@/lib/helpers";

export function AboutHero({ className }: { className?: string }) {
  return (
    <header
      className={cn("about-hero", className)}
      aria-labelledby="about-hero-title"
    >
      <div className="about-hero__inner">
        <div className="about-hero__text">
          <h1 id="about-hero-title" className="about-hero__title">
            {aboutPageHeroTitle}
          </h1>
          {aboutPageHeroIntro.map((p, i) => (
            <p key={`about-hero-intro-${i}`} className="about-hero__body">
              {p}
            </p>
          ))}
        </div>
        <div className="about-hero__media">
          <div className="about-hero__image-wrap">
            <Image
              src={aboutPageHeroImageUrl}
              alt="Vansu Studio"
              fill
              className="about-hero__image"
              sizes="(min-width: 1023px) 45vw, 100vw"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  );
}
