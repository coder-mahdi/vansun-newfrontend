"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { bookSubNav, headerNav } from "@/data/navigation";
import { cn } from "@/lib/helpers";
import { BookNowDropdown } from "./BookNowDropdown";
import { MainNav } from "./MainNav";

const DESKTOP_MIN = 768;

export function SiteHeader({ className }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookSubOpen, setBookSubOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setBookSubOpen(false);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const onChange = () => {
      if (mq.matches) {
        setBookSubOpen(false);
        setMenuOpen(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className={cn(
        "site-header",
        menuOpen && "site-header--menu-open",
        className
      )}
    >
      <div className="site-header__inner site-header__inner--desktop">
        <Link className="site-header__brand" href="/">
          Vansun
        </Link>
        <div className="site-header__center">
          <BookNowDropdown />
        </div>
        <MainNav className="site-header__nav" />
      </div>

      <div className="site-header__bar site-header__bar--mobile">
        <Link className="site-header__brand" href="/" onClick={closeMenu}>
          Vansun
        </Link>
        <button
          type="button"
          className={cn(
            "site-header__hamburger",
            menuOpen && "site-header__hamburger--open"
          )}
          aria-expanded={menuOpen}
          aria-controls="site-header-overlay"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            if (menuOpen) setBookSubOpen(false);
            setMenuOpen((v) => !v);
          }}
        >
          <span className="site-header__hamburger-line" />
          <span className="site-header__hamburger-line" />
          <span className="site-header__hamburger-line" />
        </button>
      </div>

      <div
        id="site-header-overlay"
        className={cn(
          "site-header__overlay",
          menuOpen && "site-header__overlay--visible"
        )}
        aria-hidden={!menuOpen}
      >
        <div className="site-header__overlay-top">
          <Link className="site-header__brand" href="/" onClick={closeMenu}>
            Vansun
          </Link>
          <button
            type="button"
            className="site-header__hamburger site-header__hamburger--open site-header__hamburger--in-overlay"
            aria-expanded
            aria-controls="site-header-overlay"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <span className="site-header__hamburger-line" />
            <span className="site-header__hamburger-line" />
            <span className="site-header__hamburger-line" />
          </button>
        </div>
        <nav className="site-header__overlay-nav" aria-label="Main">
          <ul className="site-header__overlay-list">
            {headerNav.map((item) => (
              <li key={item.href} className="site-header__overlay-item">
                <Link
                  className="site-header__overlay-link"
                  href={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="site-header__overlay-item site-header__overlay-item--book">
              <button
                type="button"
                className="site-header__overlay-book-toggle"
                aria-expanded={bookSubOpen}
                aria-controls="mobile-book-submenu"
                id="mobile-book-toggle"
                onClick={() => setBookSubOpen((v) => !v)}
              >
                Book
              </button>
              <ul
                id="mobile-book-submenu"
                className={cn(
                  "site-header__overlay-sublist",
                  bookSubOpen && "site-header__overlay-sublist--open"
                )}
                aria-hidden={!bookSubOpen}
              >
                {bookSubNav.map((item) => (
                  <li key={item.href} className="site-header__overlay-subitem">
                    <Link
                      className="site-header__overlay-sublink"
                      href={item.href}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
