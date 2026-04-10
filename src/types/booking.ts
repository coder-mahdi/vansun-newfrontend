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

export type PiercingBookingWizardPayload = PiercingBookingStep1Values & {
  /** All selected placements from the visual picker (multi-select). */
  piercingIds: string[];
  jewelryChoice: "change-jewelry" | "bring-own";
  jewelryTier: "basic" | "standard" | "premium" | "pro-premium" | null;
  jewelryCode: string | null;
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
