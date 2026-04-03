import { galleryItems } from "@/data/gallery";
import { cn } from "@/lib/helpers";
import { GalleryCard } from "./GalleryCard";

type GalleryGridProps = {
  category?: "piercing" | "tattoo";
  className?: string;
};

export function GalleryGrid({ category, className }: GalleryGridProps) {
  const items = category
    ? galleryItems.filter((i) => i.category === category)
    : galleryItems;
  return (
    <div className={cn("gallery-grid", className)}>
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
