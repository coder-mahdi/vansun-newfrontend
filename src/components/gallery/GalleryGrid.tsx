import { cn } from "@/lib/helpers";
import type { GalleryCategory, GalleryItem } from "@/types/gallery";
import { GalleryCard } from "./GalleryCard";

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type GalleryGridProps = {
  items: GalleryItem[];
  category?: GalleryCategory;
  /** When set, show items in any of these categories (overrides `category`). */
  categories?: GalleryCategory[];
  className?: string;
};

export function GalleryGrid({
  items,
  category,
  categories,
  className,
}: GalleryGridProps) {
  const filtered =
    categories && categories.length > 0
      ? items.filter((i) => categories.includes(i.category))
      : category
        ? items.filter((i) => i.category === category)
        : items;
  const list = shuffled(filtered);
  return (
    <div className={cn("gallery-grid", className)}>
      {list.length === 0 ? (
        <p className="gallery-grid__empty">
          No photos in this gallery yet. Check back soon.
        </p>
      ) : (
        list.map((item) => <GalleryCard key={item.id} item={item} />)
      )}
    </div>
  );
}
