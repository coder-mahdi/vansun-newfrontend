import Image from "next/image";
import Link from "next/link";

import {
  PIERCING_IMAGE_META,
  type PiercingImageKey,
} from "@/data/piercings-selection";
import { cn } from "@/lib/helpers";

const SHOWCASE_KEYS: PiercingImageKey[] = ["face-body", "lips", "ears"];

export function HomePiercingShowcase({ className }: { className?: string }) {
  return (
    <section
      className={cn("home-piercing-showcase", className)}
      aria-labelledby="home-piercing-showcase-title"
    >
      <div className="home-piercing-showcase__inner">
        <h2
          id="home-piercing-showcase-title"
          className="home-piercing-showcase__title"
        >
          Piercing references
        </h2>
        <p className="home-piercing-showcase__intro">
          Face, lip, and ear piercings. Explore your options in-studio or start
          your booking when you&apos;re ready.
        </p>
        <div className="home-piercing-showcase__grid">
          {SHOWCASE_KEYS.map((key) => {
            const meta = PIERCING_IMAGE_META[key];
            return (
              <figure key={key} className="home-piercing-showcase__card">
                <div className="home-piercing-showcase__img-wrap">
                  <Image
                    src={meta.src}
                    alt={meta.alt}
                    fill
                    className="home-piercing-showcase__img"
                    sizes="(max-width: 767px) 92vw, (max-width: 1199px) 30vw, 360px"
                  />
                </div>
                <figcaption className="home-piercing-showcase__caption">
                  {meta.title}
                </figcaption>
              </figure>
            );
          })}
        </div>
        <div className="home-piercing-showcase__cta">
          <Link href="/book/piercing" className="home-piercing-showcase__link">
            Book piercing
          </Link>
        </div>
      </div>
    </section>
  );
}
