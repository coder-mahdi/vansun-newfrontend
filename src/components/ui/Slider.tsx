"use client";

import type { ReactNode } from "react";

type SliderProps = {
  children?: ReactNode;
  className?: string;
};

export function Slider({ children, className }: SliderProps) {
  return <div className={className}>{children}</div>;
}
