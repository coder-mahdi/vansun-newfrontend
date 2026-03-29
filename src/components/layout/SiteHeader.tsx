import Link from "next/link";
import { cn } from "@/lib/helpers";
import { BookNowDropdown } from "./BookNowDropdown";
import { MainNav } from "./MainNav";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn("site-header", className)}>
      <div className="site-header__inner">
        <Link className="site-header__brand" href="/">
          Vansun
        </Link>
        <div className="site-header__center">
          <BookNowDropdown />
        </div>
        <MainNav className="site-header__nav" />
      </div>
    </header>
  );
}
