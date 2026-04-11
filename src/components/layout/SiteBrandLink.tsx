"use client";

import Link from "next/link";

import { brandLogoPath } from "@/lib/brand-assets";
import { cn } from "@/lib/helpers";

type SiteBrandLinkProps = {
  className?: string;
  onClick?: () => void;
};

/** Header mark: logo image from `public/brand/` (see `brand-assets.ts`). */
export function SiteBrandLink({ className, onClick }: SiteBrandLinkProps) {
  return (
    <Link
      className={cn("site-header__brand", className)}
      href="/"
      onClick={onClick}
      aria-label="Vansun Studio home"
    >
      <img
        src={brandLogoPath}
        alt=""
        className="site-header__brand-img"
        decoding="async"
      />
    </Link>
  );
}
