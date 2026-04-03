"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/helpers";

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Dropdown({ trigger, children, className }: DropdownProps) {
  return (
    <div className={cn("ui-dropdown", className)}>
      {trigger}
      {children}
    </div>
  );
}
