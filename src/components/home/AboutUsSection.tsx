import Link from "next/link";
import { cn } from "@/lib/helpers";

export function AboutUsSection({ className }: { className?: string }) {
  return (
    <section className={cn("about-us-section", className)} aria-labelledby="about-us-heading">
      <h2 id="about-us-heading">About us</h2>
      <Link href="/about">Learn more</Link>
    </section>
  );
}
