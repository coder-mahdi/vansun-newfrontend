import Link from "next/link";
import { cn } from "@/lib/helpers";

export function GalleryTypeSelector({ className }: { className?: string }) {
  return (
    <nav className={cn("gallery-type-selector", className)} aria-label="Gallery type">
      <Link href="/gallery">All</Link>
      <Link href="/gallery/piercing">Piercing</Link>
      <Link href="/gallery/tattoo">Tattoo</Link>
    </nav>
  );
}
