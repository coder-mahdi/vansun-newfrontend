import Link from "next/link";
import { bookNav } from "@/data/navigation";

export function BookNowDropdown({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span>Book</span>
      <ul>
        {bookNav.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
