"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { tattooStyles } from "@/data/booking";
import { cn } from "@/lib/helpers";
import {
  getDevMockBookingDates,
  getDevMockBookingTimeSlots,
  isBookingScheduleDevMock,
} from "@/lib/booking-schedule-dev";
import {
  fetchAvailableBookingDates,
  fetchAvailableBookingTimes,
  getBookingV1Base,
  postBookingCreate,
} from "@/lib/booking-v1";
import type {
  TattooBookingStep1Values,
  TattooBookingWizardPayload,
} from "@/types/booking";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

function tattooProductId(): number | undefined {
  const raw = process.env.NEXT_PUBLIC_TATTOO_BOOKING_PRODUCT_ID?.trim();
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

type WizardStep = 1 | 2 | 3;

type TattooBookingFormProps = {
  className?: string;
  onStep1Continue?: (values: TattooBookingStep1Values) => void;
  onBookingComplete?: (payload: TattooBookingWizardPayload) => void;
};

export function TattooBookingForm({
  className,
  onStep1Continue,
  onBookingComplete,
}: TattooBookingFormProps) {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<"wizard" | "success">("wizard");
  const [step, setStep] = useState<WizardStep>(1);

  const [step1, setStep1] = useState<TattooBookingStep1Values | null>(null);
  const [tattooStyle, setTattooStyle] = useState<string | null>(null);
  const [design, setDesign] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const [availableDates, setAvailableDates] = useState<
    { date: string; day: string }[]
  >([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { time: string; end_time: string }[]
  >([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const apiConfigured = getBookingV1Base().length > 0;
  const scheduleDevMock = isBookingScheduleDevMock();
  const scheduleUsable = apiConfigured || scheduleDevMock;

  useEffect(() => {
    if (scheduleDevMock) {
      setAvailableDates(getDevMockBookingDates());
      setDatesLoading(false);
      setScheduleError(null);
      return;
    }
    if (!apiConfigured) {
      setAvailableDates([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setDatesLoading(true);
      setScheduleError(null);
      try {
        const dates = await fetchAvailableBookingDates("tattoo");
        if (!cancelled) setAvailableDates(dates);
      } catch (e) {
        if (!cancelled) {
          setScheduleError(
            e instanceof Error ? e.message : "Could not load available dates."
          );
          setAvailableDates([]);
        }
      } finally {
        if (!cancelled) setDatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scheduleDevMock, apiConfigured]);

  useEffect(() => {
    if (!date) {
      setAvailableTimeSlots([]);
      setTime("");
      return;
    }
    if (scheduleDevMock) {
      setAvailableTimeSlots(getDevMockBookingTimeSlots());
      setScheduleError(null);
      return;
    }
    if (!apiConfigured) {
      setAvailableTimeSlots([]);
      setTime("");
      return;
    }
    let cancelled = false;
    (async () => {
      setScheduleError(null);
      try {
        const times = await fetchAvailableBookingTimes("tattoo", date);
        if (!cancelled) setAvailableTimeSlots(times);
      } catch (e) {
        if (!cancelled) {
          setScheduleError(
            e instanceof Error ? e.message : "Could not load time slots."
          );
          setAvailableTimeSlots([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date, scheduleDevMock, apiConfigured]);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
  }, []);

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDesign(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const removeDesign = () => {
    setDesign(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const goBack = () => {
    setSubmitError(null);
    if (step > 1) setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !date || !time) {
      return;
    }
    if (!termsAccepted) return;
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) return;

    const payload: TattooBookingStep1Values = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      termsAccepted,
      recaptchaToken,
    };
    setStep1(payload);
    onStep1Continue?.(payload);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!tattooStyle) return;
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!step1 || !tattooStyle) return;
    setSubmitError(null);
    setSubmitting(true);

    const wizardPayload: TattooBookingWizardPayload = {
      ...step1,
      style: tattooStyle,
      designDataUrl: design,
      explanation: explanation.trim(),
    };

    const productId = tattooProductId();
    const body: Record<string, unknown> = {
      full_name: step1.fullName,
      email: step1.email,
      phone: step1.phone,
      booking_date: step1.date,
      booking_time: step1.time,
      terms_accepted: step1.termsAccepted,
      service: "tattoo",
      tattoo_style: tattooStyle,
    };
    if (design) body.design = design;
    if (explanation.trim()) body.explanation = explanation.trim();
    if (step1.recaptchaToken) body.recaptcha_token = step1.recaptchaToken;
    if (productId !== undefined) body.product_id = productId;

    try {
      const base = getBookingV1Base();
      if (!base) {
        throw new Error(
          "Booking API is not configured. Set NEXT_PUBLIC_CMS_API_URL or NEXT_PUBLIC_BOOKING_API_URL."
        );
      }
      await postBookingCreate(body);
      onBookingComplete?.(wizardPayload);
      setPhase("success");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "success") {
    return (
      <div className={cn("booking-page__success-message", className)}>
        <p>
          Your tattoo appointment request was received.
          <br />
          <br />
          If you need to cancel, please email us at least 5 hours before your
          scheduled time.
        </p>
        <div className="success-buttons">
          <a className="email-btn" href="mailto:info@vansunstudio.com">
            Send email
          </a>
          <button
            type="button"
            className="home-btn"
            onClick={() => router.push("/")}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const progressLabels = ["Details", "Style", "Review"] as const;

  return (
    <div className={className}>
      {step > 1 ? (
        <div
          className="booking-wizard__progress"
          aria-label="Booking progress"
        >
          {progressLabels.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <span
                key={label}
                className={cn(
                  "booking-wizard__progress-step",
                  active && "booking-wizard__progress-step--active",
                  done && "booking-wizard__progress-step--done"
                )}
              >
                {n}. {label}
              </span>
            );
          })}
        </div>
      ) : null}

      {step === 1 ? (
        <form
          className={cn("booking-form", "tattoo-booking-form")}
          onSubmit={handleStep1Submit}
        >
          {scheduleError ? (
            <div className="booking-page__schedule-error" role="alert">
              {scheduleError}
            </div>
          ) : null}

          {scheduleDevMock ? (
            <p className="booking-page__dev-mock-banner" role="status">
              Dev mode: sample dates and times (no live shop schedule). Use{" "}
              <code className="booking-page__dev-mock-code">
                NEXT_PUBLIC_BOOKING_DEV_MOCK_SCHEDULE=1
              </code>{" "}
              to force this even when a booking API URL is set.
            </p>
          ) : null}

          <div className="personal-info-row">
            <div>
              <label htmlFor="tattoo-full-name">Full name</label>
              <input
                id="tattoo-full-name"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(ev) => setFullName(ev.target.value)}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="tattoo-email">Email</label>
              <input
                id="tattoo-email"
                name="email"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="tattoo-phone">Phone</label>
              <input
                id="tattoo-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                placeholder="Enter your phone number"
                required
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="date-time-row">
            <div>
              <label htmlFor="tattoo-date">Date</label>
              <select
                id="tattoo-date"
                name="date"
                value={date}
                onChange={(ev) => setDate(ev.target.value)}
                required
                disabled={!scheduleUsable || datesLoading}
              >
                <option value="">
                  {!scheduleUsable
                    ? "Calendar not configured (set CMS / booking API URL)"
                    : datesLoading
                      ? "Loading dates…"
                      : availableDates.length === 0
                        ? "No available dates"
                        : scheduleDevMock
                          ? "Select a date (dev sample)"
                          : "Select a date"}
                </option>
                {availableDates.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.date} ({d.day})
                  </option>
                ))}
              </select>
              {apiConfigured &&
              !scheduleDevMock &&
              !datesLoading &&
              availableDates.length === 0 ? (
                <small className="booking-page__config-hint">
                  No dates returned. Check shop schedule for tattoo in the CMS.
                </small>
              ) : null}
            </div>
            <div>
              <label htmlFor="tattoo-time">Time</label>
              <select
                id="tattoo-time"
                name="time"
                value={time}
                onChange={(ev) => setTime(ev.target.value)}
                required
                disabled={!date || availableTimeSlots.length === 0}
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {slot.time} – {slot.end_time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="design-explanation-row">
            <div className="design-upload">
              <label htmlFor="tattoo-design-file">Design (Optional):</label>
              <div
                className={cn(
                  "design-upload-container",
                  design ? "has-design" : undefined
                )}
              >
                <input
                  id="tattoo-design-file"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="design-file-input"
                  onChange={handleDesignUpload}
                />
                {design ? (
                  <div className="design-preview">
                    <img src={design} alt="Design preview" />
                    <button
                      type="button"
                      className="remove-design-btn"
                      onClick={removeDesign}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="explanation-field">
              <label htmlFor="tattoo-explanation">
                Additional Explanation (Optional):
              </label>
              <textarea
                id="tattoo-explanation"
                name="explanation"
                value={explanation}
                onChange={(ev) => setExplanation(ev.target.value)}
                placeholder="Add any additional details about your tattoo design…"
                rows={4}
              />
            </div>
          </div>

          <div className="recaptcha-terms-row">
            {RECAPTCHA_SITE_KEY ? (
              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                />
              </div>
            ) : null}
            <div className="terms-checkbox">
              <label className="terms-checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(ev) => setTermsAccepted(ev.target.checked)}
                  required
                />
                <span>
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" rel="noreferrer">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>
          </div>

          <div className="submit-row">
            <button type="submit">Continue</button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="booking-wizard__panel">
          <h2 className="booking-wizard__heading">Tattoo style</h2>
          <p className="booking-wizard__sub">
            Pick the direction that best matches your idea; we will refine
            details together in the studio.
          </p>
          <div
            className="booking-wizard__options"
            role="radiogroup"
            aria-label="Tattoo style"
          >
            {tattooStyles.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={tattooStyle === s}
                className={cn(
                  "booking-wizard__option",
                  tattooStyle === s && "booking-wizard__option--selected"
                )}
                onClick={() => setTattooStyle(s)}
              >
                <span className="booking-wizard__option-title">{s}</span>
              </button>
            ))}
          </div>
          <div className="booking-wizard__nav">
            <button
              type="button"
              className="booking-wizard__btn booking-wizard__btn--ghost"
              onClick={goBack}
            >
              Back
            </button>
            <button
              type="button"
              className="booking-wizard__btn booking-wizard__btn--primary"
              disabled={!tattooStyle}
              onClick={handleStep2Next}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 && step1 && tattooStyle ? (
        <div className="booking-wizard__panel">
          <h2 className="booking-wizard__heading">Review &amp; confirm</h2>
          <p className="booking-wizard__sub">
            Check your details before submitting. We may follow up by email to
            confirm the session.
          </p>

          {submitError ? (
            <div className="booking-wizard__error" role="alert">
              {submitError}
            </div>
          ) : null}

          <ul className="booking-wizard__summary">
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Appointment</span>
              <span className="booking-wizard__summary-value">
                {step1.date} at {step1.time}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Contact</span>
              <span className="booking-wizard__summary-value">
                {step1.fullName} · {step1.email} · {step1.phone}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Style</span>
              <span className="booking-wizard__summary-value">
                {tattooStyle}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Design</span>
              <span className="booking-wizard__summary-value">
                {design ? "Image attached" : "None"}
              </span>
            </li>
            {explanation.trim() ? (
              <li className="booking-wizard__summary-row">
                <span className="booking-wizard__summary-label">
                  Additional explanation
                </span>
                <span className="booking-wizard__summary-value">
                  {explanation.trim()}
                </span>
              </li>
            ) : null}
          </ul>

          {design ? (
            <div className="tattoo-booking-form__review-thumb">
              <p className="booking-wizard__sub">Design preview</p>
              <img src={design} alt="" className="tattoo-booking-form__review-img" />
            </div>
          ) : null}

          <div className="booking-wizard__nav">
            <button
              type="button"
              className="booking-wizard__btn booking-wizard__btn--ghost"
              onClick={goBack}
              disabled={submitting}
            >
              Back
            </button>
            <button
              type="button"
              className="booking-wizard__btn booking-wizard__btn--primary"
              onClick={() => void handleFinalSubmit()}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Book appointment"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
