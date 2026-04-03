"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/helpers";
import { bookNav } from "@/data/navigation";

export function BookNowDropdown({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("book-now-dropdown", open && "book-now-dropdown--open", className)}
    >
      <button
        type="button"
        className="book-now-dropdown__toggle"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="book-menu"
        id="book-menu-button"
        onClick={() => setOpen((v) => !v)}
      >
        Book
      </button>
      <ul
        id="book-menu"
        className="book-now-dropdown__menu"
        role="menu"
        aria-labelledby="book-menu-button"
        aria-hidden={!open}
      >
        {bookNav.map((item) => (
          <li key={item.href} className="book-now-dropdown__menu-item" role="none">
            <Link
              className="book-now-dropdown__menu-link"
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
