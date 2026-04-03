export default function GalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="gallery-page">{children}</div>;
}
