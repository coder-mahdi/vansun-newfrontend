/**
 * Piercing booking catalog: mock by default.
 * Replace with CMS/API fetch when `NEXT_PUBLIC_CONTENT_MODE=live` and endpoints exist.
 */

export type PiercingJewelryItem = {
  id: string;
  label: string;
  /** Price in CAD (jewelry only) */
  priceCad: number;
};

export type PiercingTypeCategory = {
  id: string;
  label: string;
  description?: string;
  /** Studio service fee in CAD for this piercing type */
  serviceFeeCad: number;
  jewelry: PiercingJewelryItem[];
};

/** Optional aftercare add-on (shown on review step) */
export const PIERCING_AFTERCARE_KIT_PRICE_CAD = 18;

export const piercingBookingCategories: PiercingTypeCategory[] = [
  {
    id: "ear",
    label: "Ear",
    description: "Lobe, helix, flat, conch, and other ear placements.",
    serviceFeeCad: 40,
    jewelry: [
      { id: "ear-ti-stud", label: "Implant-grade titanium stud", priceCad: 28 },
      { id: "ear-ti-hoop", label: "Titanium hinged ring", priceCad: 42 },
      { id: "ear-gold-stud", label: "14k gold threadless end + labret", priceCad: 95 },
    ],
  },
  {
    id: "nose",
    label: "Nose",
    description: "Nostril and related placements.",
    serviceFeeCad: 45,
    jewelry: [
      { id: "nose-ti-nostril", label: "Titanium nostril screw / labret", priceCad: 32 },
      { id: "nose-gold-nostril", label: "14k gold nostril stud", priceCad: 88 },
    ],
  },
  {
    id: "oral",
    label: "Oral & facial",
    description: "Lip, septum, eyebrow, and other facial piercings.",
    serviceFeeCad: 50,
    jewelry: [
      { id: "facial-ti-labret", label: "Titanium labret post + end", priceCad: 35 },
      { id: "facial-septum-ring", label: "Titanium septum clicker", priceCad: 48 },
    ],
  },
  {
    id: "body",
    label: "Body",
    description: "Navel and select surface work; final jewelry in-studio.",
    serviceFeeCad: 55,
    jewelry: [
      { id: "body-navel-ti", label: "Titanium curved bar (navel)", priceCad: 45 },
      { id: "body-navel-gold", label: "14k gold navel curve", priceCad: 120 },
    ],
  },
];

export function getPiercingCategoryById(
  id: string | null
): PiercingTypeCategory | undefined {
  if (!id) return undefined;
  return piercingBookingCategories.find((c) => c.id === id);
}

export function getPiercingJewelry(
  categoryId: string | null,
  jewelryId: string | null
): { category?: PiercingTypeCategory; jewelry?: PiercingJewelryItem } {
  const category = getPiercingCategoryById(categoryId);
  const jewelry = category?.jewelry.find((j) => j.id === jewelryId);
  return { category, jewelry };
}
