import Link from "next/link";

export function AboutUsSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="about-us-heading">
      <h2 id="about-us-heading">About us</h2>
      <Link href="/about">Learn more</Link>
    </section>
  );
}
