import Link from "next/link";
import { cn } from "@/lib/helpers";

type WorkCardProps = {
  title: string;
  href: string;
  className?: string;
};

export function WorkCard({ title, href, className }: WorkCardProps) {
  return (
    <article className={cn("work-card", className)}>
      <Link href={href}>{title}</Link>
    </article>
  );
}
