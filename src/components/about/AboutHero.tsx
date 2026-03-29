import { cn } from "@/lib/helpers";

export function AboutHero({ className }: { className?: string }) {
  return (
    <header className={cn("about-hero", className)}>
      <h1>About</h1>
    </header>
  );
}
