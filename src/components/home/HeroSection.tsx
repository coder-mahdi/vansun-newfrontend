import { HeroSlider } from "./HeroSlider";

export function HeroSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-label="Hero">
      <HeroSlider />
    </section>
  );
}
