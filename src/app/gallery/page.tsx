import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryTypeSelector } from "@/components/gallery/GalleryTypeSelector";

export default function GalleryPage() {
  return (
    <>
      <GalleryHeader title="Gallery" />
      <GalleryTypeSelector />
      <GalleryGrid />
    </>
  );
}
