"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/helpers";

type SliderProps = {
  children?: ReactNode;
  className?: string;
};

export function Slider({ children, className }: SliderProps) {
  return <div className={cn("ui-slider", className)}>{children}</div>;
}
