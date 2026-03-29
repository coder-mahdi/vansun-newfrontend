import { cn } from "@/lib/helpers";

export function JewelryStripSection({ className }: { className?: string }) {
  return (
    <section className={cn("jewelry-strip-section", className)} aria-label="Jewelry" />
  );
}
