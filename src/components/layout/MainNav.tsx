import Link from "next/link";
import { cn } from "@/lib/helpers";
import { headerNav } from "@/data/navigation";

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn("main-nav", className)} aria-label="Main">
      <ul className="main-nav__list">
        {headerNav.map((item) => (
          <li key={item.href} className="main-nav__item">
            <Link className="main-nav__link" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
