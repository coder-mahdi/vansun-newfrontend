type BlogContentSectionProps = {
  content: string;
  className?: string;
};

export function BlogContentSection({
  content,
  className,
}: BlogContentSectionProps) {
  return (
    <section className={className}>
      <div>{content}</div>
    </section>
  );
}
