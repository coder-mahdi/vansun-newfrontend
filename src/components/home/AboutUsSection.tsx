import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/helpers";

export function AboutUsSection({
  className,
  title,
  body,
  imageUrl,
  imageAlt,
}: {
  className?: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt?: string;
}) {
  return (
    <section
      className={cn("about-us-section", className)}
      aria-labelledby="home-about-title"
    >
      <div className="about-container">
        <div className="about-image">
          <Image
            src={imageUrl}
            alt={imageAlt?.trim() || title}
            fill
            className="about-image__img"
            sizes="(min-width: 1023px) 360px, (min-width: 700px) 85vw, 100vw"
            priority={false}
          />
        </div>
        <div className="about-text">
          <h2 id="home-about-title" className="about-title">
            {title}
          </h2>
          <p className="about-body">{body}</p>
          <Link href="/about" className="about-more">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
