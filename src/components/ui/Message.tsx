import { cn } from "@/lib/helpers";

type MessageProps = {
  variant?: "info" | "success" | "error";
  children: React.ReactNode;
  className?: string;
};

export function Message({ variant = "info", children, className }: MessageProps) {
  return (
    <p className={cn("ui-message", className)} data-variant={variant}>
      {children}
    </p>
  );
}
