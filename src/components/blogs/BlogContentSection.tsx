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
      <div>{content}</div>
    </section>
  );
}
