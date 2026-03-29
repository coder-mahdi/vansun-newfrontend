import { cn } from "@/lib/helpers";

type LoaderProps = { className?: string; label?: string };

export function Loader({ className, label = "Loading" }: LoaderProps) {
  return (
    <div className={cn("ui-loader", className)} role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
    </div>
  );
}
