import { getBookingV1Base } from "@/lib/booking-v1";

export type JewelryTier = "basic" | "standard" | "premium" | "pro-premium";
export type JewelryUsageArea = "face-and-body" | "lips" | "ear";

export type JewelryStoreItem = {
  image_url: string;
  code: string;
  tier: JewelryTier;
  usage_areas: JewelryUsageArea[];
  /**
   * Piercing selection ids from the booking catalog (`piercings-selection`).
   * When non-empty, this piece only appears if the guest selected at least one
   * of these piercings. When empty, tier + placement filtering only.
   */
  piercing_type_ids: string[];
  /** Extra photos after `image_url` (thumbnails + lightbox). */
  gallery_urls: string[];
};

type JewelryStoreResponse = {
  items?: unknown;
  grouped?: unknown;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function normalizeTier(raw: unknown): JewelryTier | null {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (s === "basic") return "basic";
  if (s === "standard") return "standard";
  if (s === "premium") return "premium";
  /** WP Jewelry Store CPT uses slug `pro`; booking UI uses `pro-premium`. */
  if (s === "pro") return "pro-premium";
  if (s === "pro-premium" || s === "pro_premium" || s === "propremium") {
    return "pro-premium";
  }
  return null;
}

function normalizeArea(raw: unknown): JewelryUsageArea | null {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (s === "face-and-body" || s === "face_body" || s === "faceandbody") {
    return "face-and-body";
  }
  if (s === "lips" || s === "lip") return "lips";
  if (s === "ear" || s === "ears") return "ear";
  return null;
}

function imageUrlFromRow(o: Record<string, unknown>): string {
  const direct = String(o.image_url ?? "").trim();
  if (direct) return direct;
  const main = asRecord(o.main_image);
  if (main) {
    const u = String(main.url ?? "").trim();
    if (u) return u;
  }
  return "";
}

function piercingTypeIdsFromRow(o: Record<string, unknown>): string[] {
  const raw =
    o.piercing_type_ids ??
    o.piercing_types ??
    o.compatible_piercing_ids ??
    o.piercing_ids;
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function extraImageUrlsFromRow(
  o: Record<string, unknown>,
  mainUrl: string
): string[] {
  const main = mainUrl.trim();
  const seen = new Set<string>();
  if (main) seen.add(main);
  const out: string[] = [];
  const push = (u: string) => {
    const t = u.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };
  const addFromUnknown = (v: unknown) => {
    if (typeof v === "string") {
      push(v);
      return;
    }
    if (!v || typeof v !== "object") return;
    const r = v as Record<string, unknown>;
    const u = String(r.url ?? r.src ?? r.source_url ?? "").trim();
    if (u) push(u);
  };
  const addArray = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) addFromUnknown(item);
  };
  addArray(o.gallery_urls);
  addArray(o.gallery_images);
  addArray(o.gallery);
  addArray(o.images);
  addArray(o.additional_images);
  addArray(o.media_gallery);
  return out;
}

function usageFieldsFromRow(o: Record<string, unknown>): unknown[] {
  const out: unknown[] = [];
  if (Array.isArray(o.usage_areas)) out.push(...o.usage_areas);
  else if (typeof o.usage_areas === "string") {
    out.push(
      ...String(o.usage_areas)
        .split(",")
        .map((s) => s.trim())
    );
  }
  if (Array.isArray(o.placements)) out.push(...o.placements);
  else if (typeof o.placements === "string") {
    out.push(
      ...String(o.placements)
        .split(",")
        .map((s) => s.trim())
    );
  }
  return out;
}

function normalizeItem(row: unknown): JewelryStoreItem | null {
  const o = asRecord(row);
  if (!o) return null;
  const imageUrl = imageUrlFromRow(o);
  const rawCode = String(o.code ?? "").trim();
  const fallbackCode = String(o.id ?? o.title ?? "").trim();
  const code = rawCode || fallbackCode;
  const tier = normalizeTier(o.tier);
  const usageRaw = usageFieldsFromRow(o);
  const usageAreas = [...new Set(usageRaw.map(normalizeArea).filter(Boolean))] as JewelryUsageArea[];
  if (!imageUrl || !code || !tier || usageAreas.length === 0) return null;
  const piercingTypeIds = [...new Set(piercingTypeIdsFromRow(o))];
  const galleryUrls = extraImageUrlsFromRow(o, imageUrl);
  return {
    image_url: imageUrl,
    code,
    tier,
    usage_areas: usageAreas,
    piercing_type_ids: piercingTypeIds,
    gallery_urls: galleryUrls,
  };
}

function normalizeFromGrouped(grouped: unknown): JewelryStoreItem[] {
  const g = asRecord(grouped);
  if (!g) return [];
  const out: JewelryStoreItem[] = [];
  const seen = new Set<string>();
  for (const [areaKey, byTierRaw] of Object.entries(g)) {
    const area = normalizeArea(areaKey);
    if (!area) continue;
    const byTier = asRecord(byTierRaw);
    if (!byTier) continue;
    for (const [tierKey, listRaw] of Object.entries(byTier)) {
      const tier = normalizeTier(tierKey);
      if (!tier || !Array.isArray(listRaw)) continue;
      for (const row of listRaw) {
        const base = normalizeItem({
          ...(asRecord(row) ?? {}),
          tier,
          usage_areas: [area],
        });
        if (!base) continue;
        const key = `${base.code}|${base.image_url}|${tier}|${area}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(base);
      }
    }
  }
  return out;
}

export async function fetchJewelryStoreItems(
  init?: RequestInit
): Promise<JewelryStoreItem[]> {
  /** Same host/path as working-hours & booking create (`NEXT_PUBLIC_BOOKING_API_URL` or CMS origin). */
  const base = getBookingV1Base();
  if (!base) return [];
  const res = await fetch(`${base}/content/jewelry-store`, {
    method: "GET",
    headers: { Accept: "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`jewelry-store failed: ${res.status}`);
  }
  const payload = (await res.json()) as JewelryStoreResponse;
  const root = asRecord(payload);
  const rows = Array.isArray(root?.items) ? root.items : [];
  const normalized = rows.map(normalizeItem).filter(Boolean) as JewelryStoreItem[];
  if (normalized.length > 0) return normalized;
  return normalizeFromGrouped(root?.grouped);
}
