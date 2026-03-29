import { cn } from "@/lib/helpers";

export function StudioStorySection({ className }: { className?: string }) {
  return (
    <section className={cn("studio-story-section", className)} aria-labelledby="studio-story-heading">
      <h2 id="studio-story-heading">Our story</h2>
    </section>
  );
}
