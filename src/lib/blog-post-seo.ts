import type { BlogCategory } from "@/types/blog";

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

/**
 * Turns `best-piercing-in-vancouver` → "Best Piercing in Vancouver"
 * (title case; small words lowercased when not first).
 */
export function blogHeadingFromSlug(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length === 0) return slug;
  return parts
    .map((raw, i) => {
      const w = raw.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(w)) return w;
      return w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    })
    .join(" ");
}

/**
 * Same phrase as in the URL, lowercased for natural sentence use in meta.
 */
export function blogMetaKeywordPhrase(slug: string): string {
  return blogHeadingFromSlug(slug).toLowerCase();
}

/**
 * Meta description: 140–160 chars, keyword in first sentence, CTA.
 * Formula: Looking for [keyword]? [benefit + location + trust]. Book … today.
 */
export function buildBlogMetaDescription(
  slug: string,
  category: BlogCategory
): string {
  const keyword = blogMetaKeywordPhrase(slug);
  const cta = "Book your appointment today.";
  const benefitLong =
    category === "piercing"
      ? "Experience safe, sterile, and professional piercing services at VanSun Studio in downtown Vancouver."
      : "Experience safe, sterile, and professional tattoo services at VanSun Studio in downtown Vancouver.";
  const benefitShort =
    category === "piercing"
      ? "Sterile piercing at VanSun Studio, downtown Vancouver."
      : "Professional tattoos at VanSun Studio, downtown Vancouver.";

  const compose = (benefit: string) =>
    `Looking for ${keyword}? ${benefit} ${cta}`.replace(/\s+/g, " ").trim();

  let out = compose(benefitLong);
  if (out.length > 160) out = compose(benefitShort);
  if (out.length > 160) {
    out = out.slice(0, 157).trimEnd();
    if (!out.endsWith("…")) out += "…";
  }
  if (out.length < 140) {
    const trust = " Trusted local studio with clear aftercare guidance.";
    out = compose(benefitLong + trust);
    if (out.length > 160) {
      out = compose(benefitShort + trust);
    }
    if (out.length > 160) {
      out = out.slice(0, 157).trimEnd() + "…";
    }
  }
  return out;
}
