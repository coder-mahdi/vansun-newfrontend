"use client";

import Link from "next/link";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  tattooConsentFinalCheckboxes,
  tattooConsentMainAcknowledgements,
} from "@/data/tattoo-consent-copy";
import { submitTattooConsent } from "@/lib/consent-api";
import { cn } from "@/lib/helpers";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";
import type { TattooConsentSubmitBody } from "@/types/consent";

const ACK_COUNT = tattooConsentMainAcknowledgements.length;

type TattooConsentFormProps = {
  className?: string;
};

export function TattooConsentForm({ className }: TattooConsentFormProps) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [ack, setAck] = useState<boolean[]>(() =>
    Array.from({ length: ACK_COUNT }, () => false)
  );
  const [finalReadVoluntary, setFinalReadVoluntary] = useState(false);
  const [finalDeclare, setFinalDeclare] = useState(false);
  const [termsPrivacy, setTermsPrivacy] = useState(false);

  const [initials, setInitials] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setAckAt = (index: number, value: boolean) => {
    setAck((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const buildBody = (
    recaptchaToken?: string | null
  ): TattooConsentSubmitBody => ({
    service: "tattoo",
    full_name: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    date_of_birth: dateOfBirth,
    ack_age_18_or_parental_consent: ack[0]!,
    ack_not_pregnant_nursing_condition_healing: ack[1]!,
    ack_medical_skin_disclosed_or_none: ack[2]!,
    ack_allergies_none_or_disclosed: ack[3]!,
    ack_not_intoxicated: ack[4]!,
    ack_permanent_change_no_restoration_guarantee: ack[5]!,
    ack_risks_tattooing_accepted: ack[6]!,
    ack_aftercare_received_agreed: ack[7]!,
    ack_dizziness_symptoms_will_notify: ack[8]!,
    ack_sterile_disposable_equipment_hygiene: ack[9]!,
    ack_services_sales_final_non_refundable: ack[10]!,
    ack_studio_promotional_photos_permission: ack[11]!,
    ack_release_artist_studio_voluntary: ack[12]!,
    ack_read_voluntary: finalReadVoluntary,
    ack_declare_agree_all: finalDeclare,
    terms_and_privacy_accepted: termsPrivacy,
    initials: initials.trim().toUpperCase(),
    recaptcha_token: recaptchaToken ?? undefined,
  });


  const validate = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!dateOfBirth) return "Please enter your date of birth.";
    if (ack.some((v) => !v)) return "Please confirm all agreement items.";
    if (!finalReadVoluntary) return "Please confirm you have read and agree to proceed.";
    if (!finalDeclare) return "Please confirm your declaration.";
    if (!termsPrivacy) return "Please accept the Terms & Conditions and Privacy Policy.";
    if (!initials.trim()) return "Please enter your initials.";
    if (initials.trim().length < 2) return "Initials must be at least 2 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    let recaptchaToken: string | null = null;
    if (RECAPTCHA_SITE_KEY && executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha("consent_tattoo");
      } catch {
        setError("Could not verify reCAPTCHA. Please try again.");
        return;
      }
      if (!recaptchaToken) {
        setError("Could not verify reCAPTCHA. Please try again.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await submitTattooConsent(buildBody(recaptchaToken));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={cn("consent-form-container", className)}>
        <div className="success-message">
          <h3>Thank you</h3>
          <p>Your tattoo consent has been submitted.</p>
          <Link href="/" className="home-button">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("consent-form-container", className)}
      onSubmit={handleSubmit}
      noValidate
    >
      <h1>Tattoo Consent Agreement</h1>

      <div className="form-group">
        <label className="field-label" htmlFor="tattoo-consent-full-name">
          Full Name:
        </label>
        <input
          id="tattoo-consent-full-name"
          type="text"
          name="fullName"
          autoComplete="name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="tattoo-consent-email">
          Email:
        </label>
        <input
          id="tattoo-consent-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="tattoo-consent-phone">
          Phone Number:
        </label>
        <input
          id="tattoo-consent-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="tattoo-consent-dob">
          Date of Birth:
        </label>
        <input
          id="tattoo-consent-dob"
          type="date"
          name="dateOfBirth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>

      {tattooConsentMainAcknowledgements.map((text, i) => (
        <div key={i} className="checkbox-container">
          <input
            id={`tattoo-consent-ack-${i}`}
            type="checkbox"
            checked={ack[i]}
            onChange={(e) => setAckAt(i, e.target.checked)}
          />
          <label htmlFor={`tattoo-consent-ack-${i}`}>{text}</label>
        </div>
      ))}

      <div className="checkbox-container">
        <input
          id="tattoo-consent-final-read"
          type="checkbox"
          checked={finalReadVoluntary}
          onChange={(e) => setFinalReadVoluntary(e.target.checked)}
        />
        <label htmlFor="tattoo-consent-final-read">
          {tattooConsentFinalCheckboxes[0]}
        </label>
      </div>

      <div className="checkbox-container">
        <input
          id="tattoo-consent-final-declare"
          type="checkbox"
          checked={finalDeclare}
          onChange={(e) => setFinalDeclare(e.target.checked)}
        />
        <label htmlFor="tattoo-consent-final-declare">
          {tattooConsentFinalCheckboxes[1]}
        </label>
      </div>

      <div className="checkbox-container">
        <input
          id="tattoo-consent-terms"
          type="checkbox"
          checked={termsPrivacy}
          onChange={(e) => setTermsPrivacy(e.target.checked)}
        />
        <label htmlFor="tattoo-consent-terms">
          I agree to the{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </Link>
        </label>
      </div>

      <div className="initials-field">
        <label className="field-label" htmlFor="tattoo-consent-initials">
          Initials (electronic acknowledgment):
        </label>
        <input
          id="tattoo-consent-initials"
          type="text"
          name="initials"
          autoComplete="off"
          placeholder="e.g. AB"
          maxLength={8}
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
        />
      </div>

      {error ? <div className="error-message">{error}</div> : null}

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
