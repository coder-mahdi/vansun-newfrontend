import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryTypeSelector } from "@/components/gallery/GalleryTypeSelector";

export default function GalleryPiercingPage() {
  return (
    <>
      <GalleryHeader title="Piercing gallery" />
      <GalleryTypeSelector />
      <GalleryGrid category="piercing" />
    </>
  );
}
