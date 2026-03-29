import Link from "next/link";
import { BookNowDropdown } from "./BookNowDropdown";
import { MainNav } from "./MainNav";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={className}>
      <Link href="/">Vansun</Link>
      <MainNav />
      <BookNowDropdown />
    </header>
  );
}
