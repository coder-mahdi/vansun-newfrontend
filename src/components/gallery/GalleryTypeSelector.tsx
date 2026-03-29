import Link from "next/link";

export function GalleryTypeSelector({ className }: { className?: string }) {
  return (
    <nav className={className} aria-label="Gallery type">
      <Link href="/gallery">All</Link>
      <Link href="/gallery/piercing">Piercing</Link>
      <Link href="/gallery/tattoo">Tattoo</Link>
    </nav>
  );
}
