/** Payload sent to `POST .../consents/piercing` (snake_case for typical JSON APIs). */
export type PiercingConsentSubmitBody = {
  service: "piercing";
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  ack_receiving_age_16_or_guardian: boolean;
  ack_sensitive_piercing_age_18_or_guardian: boolean;
  ack_not_pregnant_or_disclosed: boolean;
  ack_allergies_none_or_disclosed: boolean;
  ack_not_intoxicated: boolean;
  ack_permanent_change: boolean;
  ack_risks_accepted: boolean;
  ack_aftercare_agreed: boolean;
  ack_lightheaded_notice: boolean;
  ack_sterile_disposable_tools: boolean;
  ack_jewelry_sales_final: boolean;
  /** Neither the client nor their companion may take photos/video in the piercing room. */
  ack_no_client_companion_photo_video_in_piercing_room: boolean;
  ack_release_liability: boolean;
  ack_read_voluntary: boolean;
  ack_declare_agree_all: boolean;
  terms_and_privacy_accepted: boolean;
  initials: string;
  recaptcha_token?: string | null;
};

/** Payload sent to `POST .../consents/tattoo` (snake_case for typical JSON APIs). */
export type TattooConsentSubmitBody = {
  service: "tattoo";
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  ack_age_18_or_parental_consent: boolean;
  ack_not_pregnant_nursing_condition_healing: boolean;
  ack_medical_skin_disclosed_or_none: boolean;
  ack_allergies_none_or_disclosed: boolean;
  ack_not_intoxicated: boolean;
  ack_permanent_change_no_restoration_guarantee: boolean;
  ack_risks_tattooing_accepted: boolean;
  ack_aftercare_received_agreed: boolean;
  ack_dizziness_symptoms_will_notify: boolean;
  ack_sterile_disposable_equipment_hygiene: boolean;
  ack_services_sales_final_non_refundable: boolean;
  ack_studio_promotional_photos_permission: boolean;
  ack_release_artist_studio_voluntary: boolean;
  ack_read_voluntary: boolean;
  ack_declare_agree_all: boolean;
  terms_and_privacy_accepted: boolean;
  initials: string;
  recaptcha_token?: string | null;
};

export type ConsentSubmitResponse = {
  success?: boolean;
  message?: string;
};
