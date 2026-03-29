"use client";

import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/helpers";

export function HeroSlider({ className }: { className?: string }) {
  return <Slider className={cn("hero-slider", className)} />;
}
