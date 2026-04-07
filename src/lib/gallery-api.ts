/**
 * Gallery items from `NEXT_PUBLIC_API_URL` (JSON).
 *
 * **GET /gallery/items**: array or `{ items: [...] }` / `{ data: [...] }`
 * Each item: `id`, `title`, `category` (`tattoo` | `piercing` | `jewelry`),
 * `imageSrc` | `image_url` | `imageUrl`, `imageAlt` | `image_alt` | `alt`.
 */
import { galleryItems as mockGalleryItems } from "@/data/gallery";
import { apiGet } from "@/lib/api";
import { contentImageUrl } from "@/lib/content-assets";
import type { GalleryCategory, GalleryItem } from "@/types/gallery";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
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

function normalizeCategory(raw: unknown): GalleryCategory | null {
  const s = String(raw ?? "")
    .toLowerCase()
    .trim();
  if (s === "tattoo" || s === "tattoos") return "tattoo";
  if (s === "piercing" || s === "piercings") return "piercing";
  if (s === "jewelry" || s === "jewellery") return "jewelry";
  return null;
}

function normalizeGalleryRow(row: unknown): GalleryItem | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const id = String(o.id ?? o.uuid ?? "").trim();
  const title = String(o.title ?? o.name ?? "").trim();
  if (!id || !title) return null;
  const category = normalizeCategory(o.category ?? o.type ?? o.galleryType);
  if (!category) return null;
  const imageRaw =
    (o.imageSrc ?? o.image_url ?? o.imageUrl ?? o.url ?? o.src) ?? null;
  const imageStr =
    typeof imageRaw === "string" && imageRaw.trim()
      ? imageRaw.trim()
      : "";
  const localFile = String(o.imageFile ?? o.image_file ?? "").trim();
  const imageSrc = imageStr
    ? imageStr
    : localFile
      ? contentImageUrl(localFile, null)
      : "";
  if (!imageSrc) return null;
  const imageAlt = String(
    o.imageAlt ?? o.image_alt ?? o.alt ?? title
  ).trim();

  return {
    id,
    title,
    category,
    imageSrc,
    imageAlt: imageAlt || title,
  };
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const base = apiBase();
  if (!base) return [...mockGalleryItems];

  try {
    const payload = await apiGet<unknown>("/gallery/items");
    const rows = asArray(payload);
    const out = rows
      .map(normalizeGalleryRow)
      .filter(Boolean) as GalleryItem[];
    if (out.length > 0) return out;
  } catch {
    /* use mock */
  }
  return [...mockGalleryItems];
}
