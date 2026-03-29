type GalleryHeaderProps = {
  title: string;
  className?: string;
};

export function GalleryHeader({ title, className }: GalleryHeaderProps) {
  return (
    <header className={className}>
      <h1>{title}</h1>
    </header>
  );
}
