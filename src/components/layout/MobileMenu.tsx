"use client";

import { cn } from "@/lib/helpers";
import { MainNav } from "./MainNav";

export function MobileMenu({ className }: { className?: string }) {
  return (
    <div className={cn("mobile-menu", className)}>
      <MainNav />
    </div>
  );
}
