export function ArtistSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="artist-heading">
      <h2 id="artist-heading">Artist</h2>
    </section>
  );
}
