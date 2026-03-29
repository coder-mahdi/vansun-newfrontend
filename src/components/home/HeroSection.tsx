import { cn } from "@/lib/helpers";
import { HeroSlider } from "./HeroSlider";

export function HeroSection({ className }: { className?: string }) {
  return (
    <section className={cn("hero-section", className)} aria-label="Hero">
      <HeroSlider />
    </section>
  );
}
