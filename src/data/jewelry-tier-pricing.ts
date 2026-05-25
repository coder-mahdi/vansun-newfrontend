import type { JewelryTier } from "@/lib/jewelry-store-api";

/** Default tier tab when the jewelry step opens. */
export const DEFAULT_JEWELRY_TIER: JewelryTier = "standard";

/** In-studio jewelry upgrade fee by tier (CAD), same as piercing booking wizard. */
export const JEWELRY_TIER_PRICE_CAD: Record<JewelryTier, number> = {
  basic: 25,
  standard: 45,
  premium: 65,
  "pro-premium": 80,
};

export function formatJewelryPriceCad(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}
