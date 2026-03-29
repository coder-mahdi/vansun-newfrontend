import Link from "next/link";

type WorkCardProps = {
  title: string;
  href: string;
  className?: string;
};

export function WorkCard({ title, href, className }: WorkCardProps) {
  return (
    <article className={className}>
      <Link href={href}>{title}</Link>
    </article>
  );
}
