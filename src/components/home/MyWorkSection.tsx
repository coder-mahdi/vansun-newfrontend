import { WorkCard } from "./WorkCard";

export function MyWorkSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="my-work-heading">
      <h2 id="my-work-heading">My work</h2>
      <WorkCard title="Sample" href="/gallery" />
    </section>
  );
}
