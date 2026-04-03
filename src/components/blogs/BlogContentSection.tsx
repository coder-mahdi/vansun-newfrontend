import { cn } from "@/lib/helpers";

type BlogContentSectionProps = {
  content: string;
  className?: string;
};

export function BlogContentSection({
  content,
  className,
}: BlogContentSectionProps) {
  return (
    <section className={cn("blog-content-section", className)}>
      <div
        className="blog-content-section__html"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
