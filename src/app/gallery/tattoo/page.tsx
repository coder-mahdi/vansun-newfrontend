import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryTypeSelector } from "@/components/gallery/GalleryTypeSelector";

export default function GalleryTattooPage() {
  return (
    <>
      <GalleryHeader title="Tattoo gallery" />
      <GalleryTypeSelector />
      <GalleryGrid category="tattoo" />
    </>
  );
}
