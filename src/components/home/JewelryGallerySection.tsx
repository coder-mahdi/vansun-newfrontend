"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { JewelryGallerySlide } from "@/data/home-jewelry-gallery";
import { cn } from "@/lib/helpers";

function approxSlideWidth(viewportWidth: number): number {
  if (viewportWidth <= 480) return 120;
  if (viewportWidth <= 767) return 160;
  if (viewportWidth <= 1023) return 180;
  return 200;
}

function buildMarqueeSlides(
  slides: JewelryGallerySlide[],
  viewportWidth: number
) {
  if (slides.length === 0) return [];
  const slideW = approxSlideWidth(viewportWidth);
  const cycleW = slides.length * slideW;
  const repeatsPerHalf = Math.max(2, Math.ceil((viewportWidth * 2) / cycleW));
  const half = Array.from({ length: repeatsPerHalf }, () => slides).flat();
  return [...half, ...half];
}

export function JewelryGallerySection({
  className,
  title,
  intro,
  slides,
}: {
  className?: string;
  title: string;
  intro: string;
  slides: JewelryGallerySlide[];
}) {
  const baseSlides = useMemo(() => slides, [slides]);
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    function sync() {
      setViewportWidth(window.innerWidth);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const marqueeSlides = useMemo(
    () => buildMarqueeSlides(baseSlides, viewportWidth),
    [baseSlides, viewportWidth]
  );

  return (
    <section
      className={cn("jewelry-gallery-section", className)}
      aria-labelledby="jewelry-gallery-heading"
    >
      <h2 id="jewelry-gallery-heading" className="jewelry-gallery-section__bar">
        {title}
      </h2>
      <p className="jewelry-gallery-section__intro">{intro}</p>
      <div className="jewelry-gallery-section__marquee">
        <div className="jewelry-gallery-section__track">
          {marqueeSlides.map((slide, index) => (
            <div
              key={`${slide.source_url}-${index}`}
              className="jewelry-gallery-section__item"
            >
              <Image
                src={slide.source_url}
                alt={slide.alt}
                fill
                className="jewelry-gallery-section__img"
                sizes="(max-width: 480px) 120px, (max-width: 767px) 160px, (max-width: 1023px) 180px, 200px"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
