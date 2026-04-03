"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  PIERCING_AFTERCARE_KIT_PRICE_CAD,
  getPiercingJewelry,
  piercingBookingCategories,
} from "@/data/piercing-booking-catalog";
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
  PiercingBookingStep1Values,
  PiercingBookingWizardPayload,
} from "@/types/booking";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

function formatCad(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

function piercingProductId(): number | undefined {
  const raw = process.env.NEXT_PUBLIC_PIERCING_BOOKING_PRODUCT_ID?.trim();
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

type WizardStep = 1 | 2 | 3 | 4;

type PiercingBookingFormProps = {
  className?: string;
  onStep1Continue?: (values: PiercingBookingStep1Values) => void;
  onBookingComplete?: (payload: PiercingBookingWizardPayload) => void;
};

export function PiercingBookingForm({
  className,
  onStep1Continue,
  onBookingComplete,
}: PiercingBookingFormProps) {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const [phase, setPhase] = useState<"wizard" | "success">("wizard");
  const [step, setStep] = useState<WizardStep>(1);

  const [step1, setStep1] = useState<PiercingBookingStep1Values | null>(null);
  const [piercingTypeId, setPiercingTypeId] = useState<string | null>(null);
  const [jewelryId, setJewelryId] = useState<string | null>(null);
  const [aftercareKit, setAftercareKit] = useState(false);
  const [notes, setNotes] = useState("");

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

  const { category, jewelry } = useMemo(
    () => getPiercingJewelry(piercingTypeId, jewelryId),
    [piercingTypeId, jewelryId]
  );

  const totals = useMemo(() => {
    const service = category?.serviceFeeCad ?? 0;
    const jewel = jewelry?.priceCad ?? 0;
    const aftercare = aftercareKit ? PIERCING_AFTERCARE_KIT_PRICE_CAD : 0;
    return {
      serviceFeeCad: service,
      jewelryCad: jewel,
      aftercareCad: aftercare,
      totalCad: service + jewel + aftercare,
    };
  }, [category, jewelry, aftercareKit]);

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
        const dates = await fetchAvailableBookingDates("piercing");
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
        const times = await fetchAvailableBookingTimes("piercing", date);
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

  const goBack = () => {
    setSubmitError(null);
    if (step > 1) {
      setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !date || !time) {
      return;
    }
    if (!termsAccepted) return;
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) return;

    const payload: PiercingBookingStep1Values = {
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
    if (!piercingTypeId) return;
    setJewelryId(null);
    setStep(3);
  };

  const handleStep3Next = () => {
    if (!jewelryId) return;
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (!step1 || !piercingTypeId || !jewelryId) return;
    setSubmitError(null);
    setSubmitting(true);

    const totalCad = totals.totalCad;
    const wizardPayload: PiercingBookingWizardPayload = {
      ...step1,
      piercingTypeId,
      jewelryId,
      aftercareKit,
      notes: notes.trim(),
      totalCad,
    };

    const productId = piercingProductId();
    const body: Record<string, unknown> = {
      full_name: step1.fullName,
      email: step1.email,
      phone: step1.phone,
      booking_date: step1.date,
      booking_time: step1.time,
      terms_accepted: step1.termsAccepted,
      service: "piercing",
      piercing_type_id: piercingTypeId,
      jewelry_id: jewelryId,
      aftercare_kit: aftercareKit,
      notes: notes.trim() || undefined,
      estimated_total_cad: totalCad,
    };
    if (step1.recaptchaToken) {
      body.recaptcha_token = step1.recaptchaToken;
    }
    if (productId !== undefined) {
      body.product_id = productId;
    }

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
          Your piercing appointment request was received.
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

  const progressLabels = ["Details", "Type", "Jewelry", "Review"] as const;

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
          className={cn("booking-form", "piercing-booking-form")}
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
              <label htmlFor="piercing-full-name">Full name</label>
              <input
                id="piercing-full-name"
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
              <label htmlFor="piercing-email">Email</label>
              <input
                id="piercing-email"
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
              <label htmlFor="piercing-phone">Phone</label>
              <input
                id="piercing-phone"
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
              <label htmlFor="piercing-date">Date</label>
              <select
                id="piercing-date"
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
                  No dates returned. Check shop schedule for piercing in the CMS.
                </small>
              ) : null}
            </div>
            <div>
              <label htmlFor="piercing-time">Time</label>
              <select
                id="piercing-time"
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
          <h2 className="booking-wizard__heading">Piercing type</h2>
          <p className="booking-wizard__sub">
            Choose the area you are booking for. Final placement is confirmed
            in-studio with your piercer.
          </p>
          <div
            className="booking-wizard__options"
            role="radiogroup"
            aria-label="Piercing type"
          >
            {piercingBookingCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={piercingTypeId === c.id}
                className={cn(
                  "booking-wizard__option",
                  piercingTypeId === c.id && "booking-wizard__option--selected"
                )}
                onClick={() => setPiercingTypeId(c.id)}
              >
                <span className="booking-wizard__option-title">{c.label}</span>
                <span className="booking-wizard__option-meta">
                  Service from {formatCad(c.serviceFeeCad)}
                </span>
                {c.description ? (
                  <span className="booking-wizard__option-desc">
                    {c.description}
                  </span>
                ) : null}
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
              disabled={!piercingTypeId}
              onClick={handleStep2Next}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 && category ? (
        <div className="booking-wizard__panel">
          <h2 className="booking-wizard__heading">Jewelry</h2>
          <p className="booking-wizard__sub">
            Options for <strong>{category.label}</strong>. Inventory is
            subject to availability; we will confirm in-studio.
          </p>
          <div
            className="booking-wizard__options"
            role="radiogroup"
            aria-label="Jewelry"
          >
            {category.jewelry.map((j) => (
              <button
                key={j.id}
                type="button"
                role="radio"
                aria-checked={jewelryId === j.id}
                className={cn(
                  "booking-wizard__option",
                  jewelryId === j.id && "booking-wizard__option--selected"
                )}
                onClick={() => setJewelryId(j.id)}
              >
                <span className="booking-wizard__option-title">{j.label}</span>
                <span className="booking-wizard__option-meta">
                  {formatCad(j.priceCad)}
                </span>
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
              disabled={!jewelryId}
              onClick={handleStep3Next}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 && step1 && category && jewelry ? (
        <div className="booking-wizard__panel">
          <h2 className="booking-wizard__heading">Review &amp; confirm</h2>
          <p className="booking-wizard__sub">
            Check your details and estimated total. You can add aftercare
            supplies below.
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
                {step1.fullName} · {step1.email}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Type</span>
              <span className="booking-wizard__summary-value">
                {category.label}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Jewelry</span>
              <span className="booking-wizard__summary-value">
                {jewelry.label}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Service fee</span>
              <span className="booking-wizard__summary-value">
                {formatCad(totals.serviceFeeCad)}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Jewelry</span>
              <span className="booking-wizard__summary-value">
                {formatCad(totals.jewelryCad)}
              </span>
            </li>
            {aftercareKit ? (
              <li className="booking-wizard__summary-row">
                <span className="booking-wizard__summary-label">
                  Aftercare kit
                </span>
                <span className="booking-wizard__summary-value">
                  {formatCad(PIERCING_AFTERCARE_KIT_PRICE_CAD)}
                </span>
              </li>
            ) : null}
            <li className="booking-wizard__summary-row booking-wizard__summary-row--total">
              <span className="booking-wizard__summary-label">Estimated total</span>
              <span className="booking-wizard__summary-value">
                {formatCad(totals.totalCad)}
              </span>
            </li>
          </ul>

          <div className="booking-wizard__aftercare">
            <label className="booking-wizard__aftercare-label">
              <input
                type="checkbox"
                checked={aftercareKit}
                onChange={(ev) => setAftercareKit(ev.target.checked)}
              />
              <span>
                Add aftercare kit ({formatCad(PIERCING_AFTERCARE_KIT_PRICE_CAD)}
                ) — saline, instructions, and essentials for healing.
              </span>
            </label>
          </div>

          <label htmlFor="piercing-notes" className="booking-wizard__heading">
            Notes for the studio (optional)
          </label>
          <textarea
            id="piercing-notes"
            className="booking-wizard__notes"
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
            placeholder="Allergies, prior piercings, or questions…"
            rows={4}
          />

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
