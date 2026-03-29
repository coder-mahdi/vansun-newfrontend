import Link from "next/link";

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={className}>
      <nav aria-label="Footer">
        <Link href="/terms">Terms</Link>
        <Link href="/consent-form">Consent</Link>
      </nav>
    </footer>
  );
}
