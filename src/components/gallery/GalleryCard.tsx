import Image from "next/image";
import { cn } from "@/lib/helpers";
import type { GalleryItem } from "@/types/gallery";

type GalleryCardProps = {
  item: GalleryItem;
  className?: string;
};

export function GalleryCard({ item, className }: GalleryCardProps) {
  return (
    <figure className={cn("gallery-card", className)}>
      <div className="gallery-card__media">
        <Image
          className="gallery-card__img"
          src={item.imageSrc}
          alt={item.imageAlt}
          fill
          sizes="(max-width: 519px) 100vw, (max-width: 899px) 50vw, (max-width: 1199px) 33vw, 25vw"
        />
      </div>
      {item.showTitle === true ? (
        <figcaption>
          <span className="gallery-card__caption-title">{item.title}</span>
          {item.priceLabel ? (
            <span className="gallery-card__caption-price">{item.priceLabel}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
