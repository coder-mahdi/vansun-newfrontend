import { cn } from "@/lib/helpers";

export function ArtistSection({ className }: { className?: string }) {
  return (
    <section className={cn("artist-section", className)} aria-labelledby="artist-heading">
      <h2 id="artist-heading">Artist</h2>
    </section>
  );
}
