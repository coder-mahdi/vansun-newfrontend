type BlogHeroProps = {
  title: string;
  publishedAt?: string;
  className?: string;
};

export function BlogHero({ title, publishedAt, className }: BlogHeroProps) {
  return (
    <header className={className}>
      <h1>{title}</h1>
      {publishedAt ? <time dateTime={publishedAt}>{publishedAt}</time> : null}
    </header>
  );
}
