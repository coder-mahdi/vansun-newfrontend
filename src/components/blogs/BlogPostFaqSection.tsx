import { BookingFAQSection } from "@/components/booking/BookingFAQSection";
import { cn } from "@/lib/helpers";
import type { BlogCategory } from "@/types/blog";

type BlogPostFaqSectionProps = {
  category: BlogCategory;
  className?: string;
};

export async function BlogPostFaqSection({
  category,
  className,
}: BlogPostFaqSectionProps) {
  const service = category === "piercing" ? "piercing" : "tattoo";
  const title =
    category === "piercing"
      ? "Piercing — frequently asked questions"
      : "Tattoo — frequently asked questions";

  return (
    <div className={cn("blog-post-faq-wrap", className)}>
      <BookingFAQSection service={service} title={title} />
    </div>
  );
}
