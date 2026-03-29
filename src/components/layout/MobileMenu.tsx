"use client";

import { MainNav } from "./MainNav";

export function MobileMenu({ className }: { className?: string }) {
  return (
    <div className={className}>
      <MainNav />
    </div>
  );
}
