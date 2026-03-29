"use client";

import type { ReactNode } from "react";

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Dropdown({ trigger, children, className }: DropdownProps) {
  return (
    <div className={className}>
      {trigger}
      {children}
    </div>
  );
}
