/**
 * Gallery items from Vansun WordPress REST (`vansun/v1`).
 *
 * **Primary (vansun-core `includes/modules/gallery`):**
 * `GET /content/gallery` — `{ items: [...], by_category: { tattoo, piercing, jewelry } }`
 * Each item: `id`, `title`, `category`, `show_title`, `seo_keywords`, `created_at`,
 * `image: { id, url, alt }`.
 *
 * **Older JSON:** `GET /gallery/items` on `NEXT_PUBLIC_API_URL`.
 */
import { galleryItems as mockGalleryItems } from "@/data/gallery";
import { apiGet } from "@/lib/api";
import { contentImageUrl } from "@/lib/content-assets";
import { cmsPublicOrigin } from "@/lib/wp-html";
import type { GalleryCategory, GalleryItem } from "@/types/gallery";

function contentApiBase(): string {
  const content = process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  if (content) return content.replace(/\/+$/, "");
  const wp = process.env.NEXT_PUBLIC_CONSENT_API_URL?.trim();
  if (wp) return wp.replace(/\/+$/, "");
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function resolveGalleryImageUrl(url: string): string {
  let s = url.trim();
  if (!s) return s;
  if (s.startsWith("//")) {
    s = `https:${s}`;
  } else if (s.startsWith("/")) {
    const origin = cmsPublicOrigin();
    if (origin) s = `${origin}${s}`;
  }
  try {
    const parsed = new URL(s);
    if (parsed.protocol === "http:") {
      const origin = cmsPublicOrigin();
      if (origin) {
        const o = new URL(origin);
        if (parsed.hostname === o.hostname) {
          parsed.protocol = "https:";
          s = parsed.href;
        }
      }
    }
  } catch {
    return s;
  }
  return s;
}

function asArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.items)) return o.items;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.gallery)) return o.gallery;
  }
  return [];
}

/** Prefer `items`; if empty, flatten `by_category` (same shape as PHP). */
function galleryRowsFromPayload(payload: unknown): unknown[] {
  const fromItems = asArray(payload);
  if (fromItems.length > 0) return fromItems;
  if (!payload || typeof payload !== "object") return [];
  const bc = (payload as Record<string, unknown>).by_category;
  if (!bc || typeof bc !== "object") return [];
  const out: unknown[] = [];
  const seen = new Set<string>();
  for (const key of ["tattoo", "piercing", "jewelry"] as const) {
    const arr = (bc as Record<string, unknown>)[key];
    if (!Array.isArray(arr)) continue;
    for (const row of arr) {
      if (!row || typeof row !== "object") continue;
      const id = String((row as Record<string, unknown>).id ?? "").trim();
      if (id && !seen.has(id)) {
        seen.add(id);
        out.push(row);
      }
    }
  }
  return out;
}

function normalizeCategory(raw: unknown): GalleryCategory | null {
  const s = String(raw ?? "")
    .toLowerCase()
    .trim();
  if (s === "tattoo" || s === "tattoos") return "tattoo";
  if (s === "piercing" || s === "piercings") return "piercing";
  if (s === "jewelry" || s === "jewellery") return "jewelry";
  return null;
}

function imageUrlFromRow(o: Record<string, unknown>): string {
  const nested = o.image;
  if (nested && typeof nested === "object") {
    const img = nested as Record<string, unknown>;
    for (const k of ["url", "source_url", "src"] as const) {
      const v = img[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  const imageRaw =
    (o.imageSrc ?? o.image_url ?? o.imageUrl ?? o.url ?? o.src) ?? null;
  return typeof imageRaw === "string" ? imageRaw.trim() : "";
}

function imageAltFromRow(o: Record<string, unknown>, title: string): string {
  const nested = o.image;
  if (nested && typeof nested === "object") {
    const img = nested as Record<string, unknown>;
    const a = img.alt ?? img.alt_text;
    if (typeof a === "string" && a.trim()) return a.trim();
  }
  return String(
    o.imageAlt ?? o.image_alt ?? o.alt ?? title
  ).trim();
}

function normalizeGalleryRow(row: unknown): GalleryItem | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const idRaw = o.id ?? o.uuid;
  const id =
    idRaw !== undefined && idRaw !== null ? String(idRaw).trim() : "";
  const titleRaw = String(o.title ?? "").trim();
  const title = titleRaw || (id ? `Gallery image ${id}` : "");
  if (!id || !title) return null;
  const category = normalizeCategory(
    o.category ?? o.type ?? o.galleryType
  );
  if (!category) return null;

  const imageStr = imageUrlFromRow(o);
  const localFile = String(o.imageFile ?? o.image_file ?? "").trim();
  let imageSrc = imageStr
    ? resolveGalleryImageUrl(imageStr)
    : localFile
      ? contentImageUrl(localFile, null)
      : "";
  if (!imageSrc) return null;

  const imageAlt = imageAltFromRow(o, title);

  const showRaw = o.show_title ?? o.showTitle;
  const showTitle =
    typeof showRaw === "boolean" ? showRaw : false;

  return {
    id,
    title,
    category,
    imageSrc,
    imageAlt: imageAlt || title,
    ...(showTitle ? { showTitle: true } : {}),
  };
}

async function fetchVansunGalleryItems(): Promise<GalleryItem[]> {
  const base = contentApiBase();
  if (!base) return [];

  const url = `${trimSlash(base)}/content/gallery`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /content/gallery failed: ${res.status}`);
  const payload = (await res.json()) as unknown;
  const rows = galleryRowsFromPayload(payload);
  const out = rows
    .map(normalizeGalleryRow)
    .filter(Boolean) as GalleryItem[];
  return out;
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const base = contentApiBase();
  if (base) {
    try {
      const fromGallery = await fetchVansunGalleryItems();
      if (fromGallery.length > 0) return fromGallery;
    } catch {
      /* fall through */
    }
    try {
      const payload = await apiGet<unknown>("/gallery/items");
      const rows = asArray(payload);
      const out = rows
        .map(normalizeGalleryRow)
        .filter(Boolean) as GalleryItem[];
      if (out.length > 0) return out;
    } catch {
      /* mock */
    }
  }
  return [...mockGalleryItems];
}
