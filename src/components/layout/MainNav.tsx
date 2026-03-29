import Link from "next/link";
import { mainNav } from "@/data/navigation";

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={className} aria-label="Main">
      <ul>
        {mainNav.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
