"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { footerConsentNav } from "@/data/navigation";
import { cn } from "@/lib/helpers";

export function FooterConsent() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("site-footer__consent", open && "site-footer__consent--open")}
    >
      <button
        type="button"
        className="site-footer__btn site-footer__btn--block"
        aria-expanded={open}
        aria-controls="footer-consent-panel"
        id="footer-consent-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        Consent Form
      </button>
      <ul
        id="footer-consent-panel"
        className="site-footer__consent-panel"
        aria-hidden={!open}
        role="menu"
        aria-labelledby="footer-consent-trigger"
      >
        {footerConsentNav.map((item) => (
          <li key={item.href} className="site-footer__consent-panel-item" role="none">
            <Link
              className="site-footer__btn site-footer__btn--block"
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
