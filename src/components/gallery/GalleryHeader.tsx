import { cn } from "@/lib/helpers";

type GalleryHeaderProps = {
  title: string;
  /** Optional lead paragraph below the title (e.g. category-specific copy). */
  intro?: string;
  className?: string;
};

export function GalleryHeader({ title, intro, className }: GalleryHeaderProps) {
  return (
    <header className={cn("gallery-header", className)}>
      <h1>{title}</h1>
      {intro ? (
        <p className="gallery-header__intro">{intro}</p>
      ) : null}
    </header>
  );
}
