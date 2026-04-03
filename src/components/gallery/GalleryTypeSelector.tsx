"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/helpers";

const LINKS = [
  { href: "/gallery", label: "All" },
  { href: "/gallery/tattoo", label: "Tattoo" },
  { href: "/gallery/piercing", label: "Piercing" },
  { href: "/gallery/jewelry", label: "Jewelry" },
] as const;

export function GalleryTypeSelector({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("gallery-type-selector", className)}
      aria-label="Gallery type"
    >
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/gallery"
            ? pathname === "/gallery"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(active && "gallery-type-selector__link--active")}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
