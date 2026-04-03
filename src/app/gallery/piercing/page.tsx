import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryTypeSelector } from "@/components/gallery/GalleryTypeSelector";
import { fetchGalleryItems } from "@/lib/gallery-api";

export default async function GalleryPiercingPage() {
  const items = await fetchGalleryItems();
  return (
    <>
      <GalleryHeader title="Piercing gallery" />
      <GalleryTypeSelector />
      <GalleryGrid items={items} category="piercing" />
    </>
  );
}
