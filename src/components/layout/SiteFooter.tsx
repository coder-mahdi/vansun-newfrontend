import Link from "next/link";
import { cn } from "@/lib/helpers";

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("site-footer", className)}>
      <nav aria-label="Footer">
        <Link href="/terms">Terms</Link>
        <Link href="/consent-form">Consent</Link>
      </nav>
    </footer>
  );
}
