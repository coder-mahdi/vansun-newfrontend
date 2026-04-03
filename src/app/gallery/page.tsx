import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryTypeSelector } from "@/components/gallery/GalleryTypeSelector";
import { fetchGalleryItems } from "@/lib/gallery-api";

export default async function GalleryPage() {
  const items = await fetchGalleryItems();
  return (
    <>
      <GalleryHeader title="Gallery" />
      <GalleryTypeSelector />
      <GalleryGrid items={items} />
    </>
  );
}
