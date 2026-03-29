import Image from "next/image";
import type { GalleryItem } from "@/types/gallery";

type GalleryCardProps = {
  item: GalleryItem;
  className?: string;
};

export function GalleryCard({ item, className }: GalleryCardProps) {
  return (
    <figure className={className}>
      <Image
        src={item.imageSrc}
        alt={item.imageAlt}
        width={400}
        height={400}
      />
      <figcaption>{item.title}</figcaption>
    </figure>
  );
}
