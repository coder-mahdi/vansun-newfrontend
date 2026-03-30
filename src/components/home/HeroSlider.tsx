"use client";

import { useEffect, useState } from "react";

import { Loader } from "@/components/ui/Loader";
import {
  fetchWpMedia,
  fetchWpPageBySlug,
  getCmsApiOrigin,
  type HeroAcfBlock,
  type WpMedia,
} from "@/lib/cms-wordpress";
import { isLiveContentMode } from "@/lib/content-mode";
import { cn } from "@/lib/helpers";
import {
  getMockHeroImages,
  MOCK_HERO_SUBTITLE,
  MOCK_HERO_TITLE,
} from "@/data/home-hero-mock";

const HERO_PAGE_SLUG = "hero-data";

type LoadStatus = "loading" | "ready" | "error";

export function HeroSlider({ className }: { className?: string }) {
  const [heroData, setHeroData] = useState<HeroAcfBlock | null>(null);
  const [heroImages, setHeroImages] = useState<WpMedia[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchHeroData() {
      const useLiveCms = isLiveContentMode() && Boolean(getCmsApiOrigin());

      if (!useLiveCms) {
        if (!cancelled) {
          setHeroData({
            title: MOCK_HERO_TITLE,
            subtitle: MOCK_HERO_SUBTITLE,
          });
          setHeroImages(getMockHeroImages());
          setStatus("ready");
        }
        return;
      }

      try {
        const pageData = await fetchWpPageBySlug(HERO_PAGE_SLUG);
        const hero = pageData?.acf?.hero;
        if (!hero || cancelled) {
          if (!cancelled) setStatus("error");
          return;
        }

        const imageIds = hero["hero-image"];
        let images: WpMedia[] = [];
        if (imageIds && imageIds.length > 0) {
          const results = await Promise.all(
            imageIds.map((id) => fetchWpMedia(id))
          );
          images = results.filter(
            (m): m is WpMedia =>
              m != null && typeof m.source_url === "string" && m.source_url.length > 0
          );
        }

        if (!cancelled) {
          setHeroData(hero);
          setHeroImages(images);
          setStatus(images.length > 0 ? "ready" : "error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void fetchHeroData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsBlurred(window.scrollY > 100);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (status === "loading" || !heroData) {
    return (
      <section
        className={cn("hero", "hero-section", "hero--loading", className)}
        aria-busy="true"
        aria-label="Hero"
      >
        <Loader label="Loading hero" />
      </section>
    );
  }

  if (status === "error" || heroImages.length === 0) {
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

  const { title, subtitle } = heroData;

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
            {[...heroImages, ...heroImages].map((image, index) => {
              const altText =
                image.alt_text?.trim() ||
                `${title ?? "Hero"} hero image ${index + 1}`;
              return (
                <div
                  key={`${image.source_url}-${index}`}
                  className="slider-item"
                >
                  <img
                    src={image.source_url}
                    alt={altText}
                    loading={index === 0 ? "eager" : "lazy"}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                </div>
              );
            })}
          </div>
        </div>
        {title ? <h1>{title}</h1> : null}
        {subtitle ? <h2>{subtitle}</h2> : null}
      </div>
    </section>
  );
}
