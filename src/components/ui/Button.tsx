import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("ui-button", className)} {...props} />;
}
