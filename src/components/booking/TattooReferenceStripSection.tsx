import { cn } from "@/lib/helpers";

export function TattooReferenceStripSection({
  className,
}: {
  className?: string;
}) {
  return (
    <section
      className={cn("tattoo-reference-strip-section", className)}
      aria-label="Tattoo references"
    />
  );
}
