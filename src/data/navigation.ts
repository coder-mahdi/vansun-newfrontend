import type { NavItem } from "@/types/common";

export const headerNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blogs" },
  { label: "Services", href: "/#services" },
];

export const bookNav: NavItem[] = [
  { label: "Book Tattoo", href: "/book/tattoo" },
  { label: "Book Piercing", href: "/book/piercing" },
];

/** Mobile overlay: one "Book" toggle → these two links */
export const bookSubNav: NavItem[] = [
  { label: "Tattoo", href: "/book/tattoo" },
  { label: "Piercing", href: "/book/piercing" },
];

export const footerConsentNav: NavItem[] = [
  { label: "Consent Piercing", href: "/consent-form/piercing" },
  { label: "Consent Tattoo", href: "/consent-form/tattoo" },
];
