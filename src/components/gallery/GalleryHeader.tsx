import { cn } from "@/lib/helpers";

type GalleryHeaderProps = {
  title: string;
  className?: string;
};

export function GalleryHeader({ title, className }: GalleryHeaderProps) {
  return (
    <header className={cn("gallery-header", className)}>
      <h1>{title}</h1>
    </header>
  );
}
