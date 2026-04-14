"use client";

import Link from "next/link";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { ConsentFormSuccessPanel } from "@/components/consent/ConsentFormSuccessPanel";
import {
  piercingConsentFinalCheckboxes,
  piercingConsentMainAcknowledgements,
  piercingConsentNoClientCompanionPhotoVideo,
  piercingConsentReleaseLine,
} from "@/data/piercing-consent-copy";
import { submitPiercingConsent } from "@/lib/consent-api";
import { cn } from "@/lib/helpers";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";
import type { PiercingConsentSubmitBody } from "@/types/consent";

type PiercingConsentFormProps = {
  className?: string;
};

export function PiercingConsentForm({ className }: PiercingConsentFormProps) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [ackMain, setAckMain] = useState(false);
  const [finalReadVoluntary, setFinalReadVoluntary] = useState(false);
  const [finalDeclare, setFinalDeclare] = useState(false);
  const [termsPrivacy, setTermsPrivacy] = useState(false);

  const [initials, setInitials] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const buildBody = (
    recaptchaToken?: string | null
  ): PiercingConsentSubmitBody => {
    const m = ackMain;
    return {
      service: "piercing",
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date_of_birth: dateOfBirth,
      ack_receiving_age_16_or_guardian: m,
      ack_sensitive_piercing_age_18_or_guardian: m,
      ack_not_pregnant_or_disclosed: m,
      ack_allergies_none_or_disclosed: m,
      ack_not_intoxicated: m,
      ack_permanent_change: m,
      ack_risks_accepted: m,
      ack_aftercare_agreed: m,
      ack_lightheaded_notice: m,
      ack_sterile_disposable_tools: m,
      ack_jewelry_sales_final: m,
      ack_no_client_companion_photo_video_in_piercing_room: m,
      ack_release_liability: m,
      ack_read_voluntary: finalReadVoluntary,
      ack_declare_agree_all: finalDeclare,
      terms_and_privacy_accepted: termsPrivacy,
      initials: initials.trim().toUpperCase(),
      recaptcha_token: recaptchaToken ?? undefined,
    };
  };


  const validate = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!dateOfBirth) return "Please enter your date of birth.";
    if (!ackMain)
      return "Please confirm you have read and agree to all statements listed above.";
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
        recaptchaToken = await executeRecaptcha("consent_piercing");
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
      await submitPiercingConsent(buildBody(recaptchaToken));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillSameFormAgain = () => {
    setSuccess(false);
    setError(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setDateOfBirth("");
    setAckMain(false);
    setFinalReadVoluntary(false);
    setFinalDeclare(false);
    setTermsPrivacy(false);
    setInitials("");
  };

  if (success) {
    return (
      <div className={cn("consent-form-container", className)}>
        <ConsentFormSuccessPanel
          currentService="piercing"
          bodyText="Your piercing consent has been submitted."
          onFillSameAgain={fillSameFormAgain}
        />
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

      <ul className="consent-ack-list">
        {piercingConsentMainAcknowledgements.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
        <li>{piercingConsentNoClientCompanionPhotoVideo}</li>
        <li>{piercingConsentReleaseLine}</li>
      </ul>

      <div className="checkbox-container">
        <input
          id="consent-ack-main"
          type="checkbox"
          checked={ackMain}
          onChange={(e) => setAckMain(e.target.checked)}
        />
        <label htmlFor="consent-ack-main">
          I have read, understood, and agree to all of the statements listed above,
          including the policy on photos and video in the piercing room and the
          liability release.
        </label>
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

      {error ? <div className="error-message">{error}</div> : null}

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
