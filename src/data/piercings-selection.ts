/**
 * Visual piercing picker: three reference images + list selection + highlight rings.
 */

export type PiercingImageKey = "face-body" | "lips" | "ears";

export type PiercingPricingTier = "standard" | "lip";

export type PiercingSelectionDef = {
  id: string;
  label: string;
  image: PiercingImageKey;
  pricing: PiercingPricingTier;
  /** Highlight / hit zone center, % of image */
  x: number;
  y: number;
  hitSizePct?: number;
};

export const PIERCING_SERVICE_BASE_CAD = 39;
/** Lip / mouth sheet: price is per piercing (each hole), e.g. ×2 in cart = 2× this. */
export const PIERCING_LIP_CAD = 19;
export const PIERCING_PRICE_BY_ID_CAD: Record<string, number> = {
  "angel-bites": 75,
  "anti-eyebrow": 59,
  "anti-tragus": 59,
  ashley: 45,
  daith: 59,
  "hidden-helix": 45,
  "inverted-lobe": 49,
  jestrum: 49,
  labret: 39,
  lobe: 19,
  medusa: 45,
  monroe: 45,
  navel: 45,
  nipple: 59,
  rook: 49,
  septum: 45,
  "shark-bites": 75,
  "stacked-lobe": 19,
  "snake-bites": 75,
  tongue: 59,
  tragus: 45,
  "upper-lobe": 19,
  "vertical-helix": 45,
  "vertical-labret": 59,
};

export const PIERCING_IMAGE_META: Record<
  PiercingImageKey,
  { src: string; title: string; alt: string; categoryTabLabel: string }
> = {
  "face-body": {
    src: "/images/piercings/face-body.webp",
    title: "Face & body",
    categoryTabLabel: "Face & body",
    alt: "Face, tongue, nipple, and navel piercing reference",
  },
  lips: {
    src: "/images/piercings/lips.webp",
    title: "Lip & mouth",
    categoryTabLabel: "Lips",
    alt: "Lip and oral piercing reference",
  },
  ears: {
    src: "/images/piercings/ear.webp",
    title: "Ear",
    categoryTabLabel: "Ear",
    alt: "Ear piercing reference",
  },
};

const DEFAULT_HIT = 10;

/** Face & body (image 1) — coordinates tuned for face-body layout; adjust as needed. */
const faceBody: PiercingSelectionDef[] = [
  {
    id: "nostril",
    label: "Nostril",
    image: "face-body",
    pricing: "standard",
    x: 9.5,
    y: 56.5,
    hitSizePct: 9,
  },
  {
    id: "septum",
    label: "Septum",
    image: "face-body",
    pricing: "standard",
    x: 35.5,
    y: 56.8,
    hitSizePct: 9,
  },
  {
    id: "eyebrow",
    label: "Eyebrow",
    image: "face-body",
    pricing: "standard",
    x: 37.5,
    y: 16.5,
  },
  {
    id: "anti-eyebrow",
    label: "Anti Eyebrow",
    image: "face-body",
    pricing: "standard",
    x: 54.5,
    y: 32.5,
  },
  {
    id: "tongue",
    label: "Tongue",
    image: "face-body",
    pricing: "standard",
    x: 34.5,
    y: 74.5,
  },
  {
    id: "navel",
    label: "Navel",
    image: "face-body",
    pricing: "standard",
    x: 78.5,
    y: 63.5,
  },
  {
    id: "nipple",
    label: "Nipple",
    image: "face-body",
    pricing: "standard",
    x: 74.5,
    y: 27.5,
  },
];

/** Lip / mouth (image 2) — approximate; refine when artwork is final. */
const lips: PiercingSelectionDef[] = [
  { id: "medusa", label: "Medusa", image: "lips", pricing: "lip", x: 50, y: 34 },
  { id: "jestrum", label: "Jestrum", image: "lips", pricing: "lip", x: 50, y: 42 },
  { id: "monroe", label: "Monroe", image: "lips", pricing: "lip", x: 38, y: 44 },
  { id: "angel-bites", label: "Angel Bites", image: "lips", pricing: "lip", x: 44, y: 48 },
  {
    id: "shark-bites",
    label: "Shark Bites",
    image: "lips",
    pricing: "lip",
    x: 50,
    y: 52,
  },
  {
    id: "snake-bites",
    label: "Snake Bites",
    image: "lips",
    pricing: "lip",
    x: 46,
    y: 56,
  },
  { id: "labret", label: "Labret", image: "lips", pricing: "lip", x: 50, y: 60 },
  {
    id: "vertical-labret",
    label: "Vertical Labret",
    image: "lips",
    pricing: "lip",
    x: 42,
    y: 58,
  },
  { id: "ashley", label: "Ashley", image: "lips", pricing: "lip", x: 58, y: 56 },
];

const earLabels: { id: string; label: string }[] = [
  { id: "helix", label: "Helix" },
  { id: "forward-helix", label: "Forward Helix" },
  { id: "vertical-helix", label: "Vertical Helix" },
  { id: "hidden-helix", label: "Hidden Helix" },
  { id: "rook", label: "Rook" },
  { id: "daith", label: "Daith" },
  { id: "conch", label: "Conch" },
  { id: "snug", label: "Snug" },
  { id: "anti-tragus", label: "Anti-Tragus" },
  { id: "tragus", label: "Tragus" },
  { id: "lobe", label: "Lobe" },
  { id: "upper-lobe", label: "Upper Lobe" },
  { id: "stacked-lobe", label: "Stacked Lobe" },
  { id: "inverted-lobe", label: "Inverted Lobe" },
];

const earCount = earLabels.length;
const ears: PiercingSelectionDef[] = earLabels.map((e, i) => {
  const t = earCount > 1 ? i / (earCount - 1) : 0.5;
  return {
    id: e.id,
    label: e.label,
    image: "ears",
    pricing: "standard",
    x: 32 + (i % 3) * 6,
    y: 16 + t * 68,
    hitSizePct: 9,
  };
});

export const piercingSelectionDefs: PiercingSelectionDef[] = [
  ...faceBody,
  ...lips,
  ...ears,
];

/** Flat `{ id, label }[]` for quick reference / CMS sync. */
export const piercings = piercingSelectionDefs.map((d) => ({
  id: d.id,
  label: d.label,
}));

const byId = new Map(piercingSelectionDefs.map((d) => [d.id, d]));

export function getPiercingSelectionDef(
  id: string
): PiercingSelectionDef | undefined {
  return byId.get(id);
}

export function getPiercingServiceCad(def: PiercingSelectionDef): number {
  const byId = PIERCING_PRICE_BY_ID_CAD[def.id];
  if (typeof byId === "number") return byId;
  if (def.pricing === "lip") return PIERCING_LIP_CAD;
  return PIERCING_SERVICE_BASE_CAD;
}

export function getPiercingPriceCadById(id: string): number {
  const d = byId.get(id);
  return d ? getPiercingServiceCad(d) : PIERCING_SERVICE_BASE_CAD;
}

export function defsForImage(key: PiercingImageKey): PiercingSelectionDef[] {
  return piercingSelectionDefs.filter((d) => d.image === key);
}

/** Expand quantities into a flat id list (API / jewelry usage). */
export function flattenPiercingQuantities(
  quantities: Record<string, number>
): string[] {
  const out: string[] = [];
  for (const [id, n] of Object.entries(quantities)) {
    const qty = Math.max(0, Math.floor(Number(n)));
    for (let i = 0; i < qty; i++) out.push(id);
  }
  return out;
}

export function totalPiercingCount(quantities: Record<string, number>): number {
  return Object.values(quantities).reduce((a, b) => a + Math.max(0, Math.floor(b)), 0);
}

export const piercingImageOrder: PiercingImageKey[] = [
  "face-body",
  "lips",
  "ears",
];
