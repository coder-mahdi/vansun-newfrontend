"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  piercingConsentFinalCheckboxes,
  piercingConsentMainAcknowledgements,
  piercingConsentNoClientCompanionPhotoVideo,
  piercingConsentReleaseLine,
} from "@/data/piercing-consent-copy";
import { submitPiercingConsent } from "@/lib/consent-api";
import { cn } from "@/lib/helpers";
import type { PiercingConsentSubmitBody } from "@/types/consent";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

const ACK_COUNT = piercingConsentMainAcknowledgements.length;

type PiercingConsentFormProps = {
  className?: string;
};

export function PiercingConsentForm({ className }: PiercingConsentFormProps) {
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [ack, setAck] = useState<boolean[]>(() => Array.from({ length: ACK_COUNT }, () => false));
  const [noClientCompanionMedia, setNoClientCompanionMedia] = useState(false);
  const [releaseLiability, setReleaseLiability] = useState(false);
  const [finalReadVoluntary, setFinalReadVoluntary] = useState(false);
  const [finalDeclare, setFinalDeclare] = useState(false);
  const [termsPrivacy, setTermsPrivacy] = useState(false);

  const [initials, setInitials] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
  }, []);

  const setAckAt = (index: number, value: boolean) => {
    setAck((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const buildBody = (): PiercingConsentSubmitBody => ({
    service: "piercing",
    full_name: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    date_of_birth: dateOfBirth,
    ack_receiving_age_16_or_guardian: ack[0]!,
    ack_sensitive_piercing_age_18_or_guardian: ack[1]!,
    ack_not_pregnant_or_disclosed: ack[2]!,
    ack_allergies_none_or_disclosed: ack[3]!,
    ack_not_intoxicated: ack[4]!,
    ack_permanent_change: ack[5]!,
    ack_risks_accepted: ack[6]!,
    ack_aftercare_agreed: ack[7]!,
    ack_lightheaded_notice: ack[8]!,
    ack_sterile_disposable_tools: ack[9]!,
    ack_jewelry_sales_final: ack[10]!,
    ack_no_client_companion_photo_video_in_piercing_room: noClientCompanionMedia,
    ack_release_liability: releaseLiability,
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
    if (!noClientCompanionMedia)
      return "Please confirm the policy on photos and video in the piercing room.";
    if (!releaseLiability) return "Please confirm the liability release.";
    if (!finalReadVoluntary) return "Please confirm you have read and agree to proceed.";
    if (!finalDeclare) return "Please confirm your declaration.";
    if (!termsPrivacy) return "Please accept the Terms & Conditions and Privacy Policy.";
    if (!initials.trim()) return "Please enter your initials.";
    if (initials.trim().length < 2) return "Initials must be at least 2 characters.";
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) return "Please complete the reCAPTCHA.";
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
    setSubmitting(true);
    try {
      const body = buildBody();
      await submitPiercingConsent(body);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={cn("consent-form-container", className)}>
        <div className="success-message">
          <h3>Thank you</h3>
          <p>Your piercing consent has been submitted.</p>
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
      <h1>Piercing Consent Agreement</h1>

      <div className="form-group">
        <label className="field-label" htmlFor="consent-full-name">
          Full Name:
        </label>
        <input
          id="consent-full-name"
          type="text"
          name="fullName"
          autoComplete="name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="consent-email">
          Email:
        </label>
        <input
          id="consent-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="consent-phone">
          Phone Number:
        </label>
        <input
          id="consent-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="consent-dob">
          Date of Birth:
        </label>
        <input
          id="consent-dob"
          type="date"
          name="dateOfBirth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>

      {piercingConsentMainAcknowledgements.map((text, i) => (
        <div key={i} className="checkbox-container">
          <input
            id={`consent-ack-${i}`}
            type="checkbox"
            checked={ack[i]}
            onChange={(e) => setAckAt(i, e.target.checked)}
          />
          <label htmlFor={`consent-ack-${i}`}>{text}</label>
        </div>
      ))}

      <div className="checkbox-container">
        <input
          id="consent-no-client-media"
          type="checkbox"
          checked={noClientCompanionMedia}
          onChange={(e) => setNoClientCompanionMedia(e.target.checked)}
        />
        <label htmlFor="consent-no-client-media">
          {piercingConsentNoClientCompanionPhotoVideo}
        </label>
      </div>

      <div className="checkbox-container">
        <input
          id="consent-release"
          type="checkbox"
          checked={releaseLiability}
          onChange={(e) => setReleaseLiability(e.target.checked)}
        />
        <label htmlFor="consent-release">{piercingConsentReleaseLine}</label>
      </div>

      <div className="checkbox-container">
        <input
          id="consent-final-read"
          type="checkbox"
          checked={finalReadVoluntary}
          onChange={(e) => setFinalReadVoluntary(e.target.checked)}
        />
        <label htmlFor="consent-final-read">{piercingConsentFinalCheckboxes[0]}</label>
      </div>

      <div className="checkbox-container">
        <input
          id="consent-final-declare"
          type="checkbox"
          checked={finalDeclare}
          onChange={(e) => setFinalDeclare(e.target.checked)}
        />
        <label htmlFor="consent-final-declare">{piercingConsentFinalCheckboxes[1]}</label>
      </div>

      <div className="checkbox-container">
        <input
          id="consent-terms"
          type="checkbox"
          checked={termsPrivacy}
          onChange={(e) => setTermsPrivacy(e.target.checked)}
        />
        <label htmlFor="consent-terms">
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
        <label className="field-label" htmlFor="consent-initials">
          Initials (electronic acknowledgment):
        </label>
        <input
          id="consent-initials"
          type="text"
          name="initials"
          autoComplete="off"
          placeholder="e.g. AB"
          maxLength={8}
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
        />
      </div>

      {RECAPTCHA_SITE_KEY ? (
        <div className="recaptcha-container">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
          />
        </div>
      ) : null}

      {error ? <div className="error-message">{error}</div> : null}

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
