import { cn } from "@/lib/helpers";
import { BlogGrid } from "./BlogGrid";

export function RelatedBlogsSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("related-blogs-section", className)}
      aria-labelledby="related-blogs-heading"
    >
      <h2 id="related-blogs-heading">Related</h2>
      <BlogGrid />
    </section>
  );
}
