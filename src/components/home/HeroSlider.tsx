"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import type { HomeHeroPayload } from "@/lib/home-cms";
import type { WpMedia } from "@/lib/cms-wordpress";
import { cn } from "@/lib/helpers";

const TATNIX_APP_URL = "https://app.tattnix.com/";

/** Match `.slider-item` widths in `_hero-section.scss` breakpoints (approximate vw). */
/** Keep in sync with `.slider-item` width/height in `_hero-section.scss`. */
function approxHeroSlideWidth(viewportWidth: number): number {
  if (viewportWidth <= 480) return 120;
  if (viewportWidth <= 767) return 160;
  if (viewportWidth <= 1023) return 180;
  return 200;
}

/**
 * Build a track of `[…half, …half]` so `translateX(-50%)` loops seamlessly and
 * each half is at least ~2× viewport wide (no empty strip beside the marquee).
 */
function buildMarqueeSlides(images: WpMedia[], viewportWidth: number): WpMedia[] {
  if (images.length === 0) return [];
  const slideW = approxHeroSlideWidth(viewportWidth);
  const cycleW = images.length * slideW;
  const repeatsPerHalf = Math.max(2, Math.ceil((viewportWidth * 2) / cycleW));
  const half = Array.from({ length: repeatsPerHalf }, () => images).flat();
  return [...half, ...half];
}

export function HeroSlider({
  className,
  hero,
}: {
  className?: string;
  hero: HomeHeroPayload;
}) {
  const [isBlurred, setIsBlurred] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    function syncWidth() {
      setViewportWidth(window.innerWidth);
    }
    syncWidth();
    window.addEventListener("resize", syncWidth);
    return () => window.removeEventListener("resize", syncWidth);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsBlurred(window.scrollY > 100);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const marqueeSlides = useMemo(
    () => buildMarqueeSlides(hero.images, viewportWidth),
    [hero.images, viewportWidth]
  );

  if (hero.images.length === 0) {
    return (
      <section
        className={cn("hero", "hero-section", "hero--empty", className)}
        role="alert"
        aria-label="Hero"
      >
        <p className="hero__unavailable">Hero content unavailable.</p>
      </section>
    );
  }

  const { title, subtitle } = hero;

  return (
    <section
      className={cn(
        "hero",
        "hero-section",
        isBlurred ? "blurred" : "",
        className
      )}
      aria-label="Hero"
    >
      <div className="hero-content">
        <div className="slider-container">
          <div className="slider-track">
            {marqueeSlides.map((image, index) => {
              const altText =
                image.alt_text?.trim() ||
                `${title ?? "Hero"} hero image ${index + 1}`;
              return (
                <div
                  key={`${image.source_url}-${index}`}
                  className="slider-item"
                >
                  <Image
                    src={image.source_url}
                    alt={altText}
                    fill
                    className="hero-slide-img"
                    sizes="(max-width: 480px) 120px, (max-width: 767px) 160px, (max-width: 1023px) 180px, 200px"
                    priority={index === 0}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {title ? <h1>{title}</h1> : null}
        {subtitle ? <h2>{subtitle}</h2> : null}
        <div className="hero-tattnix-promo">
          <div className="hero-tattnix-tilt">
            <a
              href={TATNIX_APP_URL}
              className="hero-tattnix-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tattnix Quiz ✦
            </a>
            <p className="hero-tattnix-tagline">
              Looking for tattoo ideas based on your mood? Try this fun app.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
