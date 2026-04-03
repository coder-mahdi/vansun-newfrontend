import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn("ui-select", className)} {...props}>
      {children}
    </select>
  );
}
