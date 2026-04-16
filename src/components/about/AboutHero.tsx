import Image from "next/image";

import {
  aboutPageHeroImageUrls,
  aboutPageHeroIntro,
  aboutPageHeroTitle,
} from "@/data/about-page";
import { cn } from "@/lib/helpers";

const HERO_ALTS = [
  "Masi Aghdam, founder of Vansun Studio",
  "Masi Aghdam, Vansun Studio",
] as const;

export function AboutHero({ className }: { className?: string }) {
  const images = aboutPageHeroImageUrls;

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
        <div
          className={cn(
            "about-hero__media",
            images.length > 1 && "about-hero__media--grid"
          )}
        >
          <div
            className={cn(
              "about-hero__media-grid",
              images.length === 1 && "about-hero__media-grid--single"
            )}
          >
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="about-hero__image-wrap"
              >
                <Image
                  src={src}
                  alt={HERO_ALTS[i] ?? `Vansun Studio, photo ${i + 1}`}
                  fill
                  className="about-hero__image"
                  sizes={
                    images.length > 1
                      ? "(min-width: 1023px) 22vw, (min-width: 600px) 45vw, 100vw"
                      : "(min-width: 1023px) 45vw, 100vw"
                  }
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
