/**
 * WordPress REST helpers for headless CMS. Base URL from NEXT_PUBLIC_CMS_API_URL.
 */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getCmsApiOrigin(): string {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_CMS_API_URL ?? "");
}

export type WpPage<TAcf = Record<string, unknown>> = {
  acf?: TAcf;
};

export type HeroAcfBlock = {
  title?: string;
  subtitle?: string;
  heading?: string;
  sub_title?: string;
  /** Gallery of attachment IDs (ACF field name may vary). */
  "hero-image"?: number[] | unknown;
  hero_images?: unknown;
  images?: unknown;
};

export type WpMedia = {
  source_url: string;
  alt_text?: string;
};

export async function fetchWpPageBySlug<TAcf = Record<string, unknown>>(
  slug: string
): Promise<WpPage<TAcf> | null> {
  const origin = getCmsApiOrigin();
  if (!origin) return null;
  const res = await fetch(
    `${origin}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return null;
  const pages = (await res.json()) as WpPage<TAcf>[];
  return pages[0] ?? null;
}

export async function fetchWpMedia(id: number): Promise<WpMedia | null> {
  const origin = getCmsApiOrigin();
  if (!origin) return null;
  const res = await fetch(`${origin}/wp-json/wp/v2/media/${id}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<WpMedia>;
}
