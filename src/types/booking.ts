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
  piercingTypeId: string;
  jewelryId: string;
  aftercareKit: boolean;
  notes: string;
  /** Sum of service fee + jewelry + optional aftercare (CAD) */
  totalCad: number;
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
