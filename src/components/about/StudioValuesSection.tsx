import { cn } from "@/lib/helpers";

export function StudioValuesSection({ className }: { className?: string }) {
  return (
    <section className={cn("studio-values-section", className)} aria-labelledby="values-heading">
      <h2 id="values-heading">Values</h2>
    </section>
  );
}
