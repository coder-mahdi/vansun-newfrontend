"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { footerConsentNav } from "@/data/navigation";
import { cn } from "@/lib/helpers";

const PIERCING_HREF = "/consent-form/piercing";
const TATTOO_HREF = "/consent-form/tattoo";

type ConsentFormSuccessPanelProps = {
  className?: string;
  currentService: "tattoo" | "piercing";
  onFillSameAgain: () => void;
  bodyText: string;
};

export function ConsentFormSuccessPanel({
  className,
  currentService,
  onFillSameAgain,
  bodyText,
}: ConsentFormSuccessPanelProps) {
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
    <div className={cn("consent-form-success", className)}>
      <h3 className="consent-form-success__title">Thank you</h3>
      <p className="consent-form-success__body">{bodyText}</p>

      <div className="consent-form-success__actions">
        <Link
          href="/"
          className="consent-form-success__btn consent-form-success__btn--primary"
        >
          Back to home
        </Link>

        <div
          ref={rootRef}
          className={cn(
            "consent-form-success__new",
            open && "consent-form-success__new--open"
          )}
        >
          <button
            type="button"
            className="consent-form-success__btn consent-form-success__btn--toggle"
            aria-expanded={open}
            aria-controls="consent-success-new-panel"
            id="consent-success-new-trigger"
            onClick={() => setOpen((v) => !v)}
          >
            Fill a new form
          </button>
          <ul
            id="consent-success-new-panel"
            className="consent-form-success__panel"
            aria-hidden={!open}
            role="menu"
            aria-labelledby="consent-success-new-trigger"
          >
            {footerConsentNav.map((item) => {
              const isSame =
                (currentService === "piercing" && item.href === PIERCING_HREF) ||
                (currentService === "tattoo" && item.href === TATTOO_HREF);
              return (
                <li
                  key={item.href}
                  className="consent-form-success__panel-item"
                  role="none"
                >
                  {isSame ? (
                    <button
                      type="button"
                      className="consent-form-success__panel-link"
                      role="menuitem"
                      onClick={() => {
                        setOpen(false);
                        onFillSameAgain();
                      }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="consent-form-success__panel-link"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
