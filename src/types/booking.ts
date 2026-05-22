import type { JewelryTier } from "@/lib/jewelry-store-api";

/** Step 1: contact + slot (multi-step piercing flow) */
export type PiercingBookingStep1Values = {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  termsAccepted: boolean;
  recaptchaToken: string | null;
};

/** One studio-jewelry pick per piercing service unit (same order as `piercingIds`). */
export type PiercingJewelrySlotLine = {
  piercingId: string;
  tier: JewelryTier;
  code: string;
  imageUrl: string | null;
  feeCad: number;
};

export type PiercingBookingWizardPayload = PiercingBookingStep1Values & {
  /** Count per placement id (canonical). */
  piercingQuantities: Record<string, number>;
  /** Expanded list (same id repeated per unit); kept for API / legacy consumers. */
  piercingIds: string[];
  jewelryChoice: "change-jewelry" | "bring-own";
  jewelryTier: "basic" | "standard" | "premium" | "pro-premium" | null;
  jewelryCode: string | null;
  /** When studio jewelry: one line per piercing slot; null if bring-your-own. */
  jewelrySlots: PiercingJewelrySlotLine[] | null;
  /** Resolved from jewelry store API when studio jewelry is chosen. */
  jewelryImageUrl: string | null;
  aftercareKit: boolean;
  notes: string;
  /** Sum of per-piercing service + optional aftercare (CAD) */
  totalCad: number;
  /** API compat: use `multi` with `piercingIds`. */
  piercingTypeId: string;
  /** API compat: in-studio jewelry */
  jewelryId: string;
};

export type PiercingBookingPayload = {
  name: string;
  email: string;
  placement: string;
};

export type TattooBookingPayload = {
  name: string;
  email: string;
  style: string;
};

export type TattooBookingStep1Values = PiercingBookingStep1Values;

export type TattooBookingWizardPayload = TattooBookingStep1Values & {
  style: string;
  /** data URL from optional reference upload */
  designDataUrl: string | null;
  explanation: string;
};
