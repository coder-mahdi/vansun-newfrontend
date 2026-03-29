import { BlogGrid } from "./BlogGrid";

export function RelatedBlogsSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="related-blogs-heading">
      <h2 id="related-blogs-heading">Related</h2>
      <BlogGrid />
    </section>
  );
}
