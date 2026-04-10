"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { PiercingVisualPicker } from "@/components/booking/PiercingVisualPicker";
import { PIERCING_AFTERCARE_KIT_PRICE_CAD } from "@/data/piercing-booking-catalog";
import {
  getPiercingPriceCadById,
  getPiercingSelectionDef,
} from "@/data/piercings-selection";
import { useBookingSchedule } from "@/hooks/use-booking-schedule";
import { cn } from "@/lib/helpers";
import {
  fetchJewelryStoreItems,
  type JewelryStoreItem,
  type JewelryTier,
  type JewelryUsageArea,
} from "@/lib/jewelry-store-api";
import { getBookingV1Base, postBookingCreate } from "@/lib/booking-v1";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";
import type {
  PiercingBookingStep1Values,
  PiercingBookingWizardPayload,
} from "@/types/booking";

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

const JEWELRY_TIERS: JewelryTier[] = [
  "basic",
  "standard",
  "premium",
  "pro-premium",
];
const JEWELRY_TIER_PRICE_CAD: Record<JewelryTier, number> = {
  basic: 23,
  standard: 43,
  premium: 65,
  "pro-premium": 78,
};
const SALES_TAX_RATE = 0.12;
const PIERCER_NOTIFICATION_EMAIL = "masiworld93@gmail.com";

function jewelryTierLabel(tier: JewelryTier): string {
  if (tier === "pro-premium") return "Pro premium";
  return tier.slice(0, 1).toUpperCase() + tier.slice(1);
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
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [phase, setPhase] = useState<"wizard" | "success">("wizard");
  const [step, setStep] = useState<WizardStep>(1);

  const [step1, setStep1] = useState<PiercingBookingStep1Values | null>(null);
  const [selectedPiercingIds, setSelectedPiercingIds] = useState<string[]>([]);
  const [jewelryChoice, setJewelryChoice] = useState<
    "change-jewelry" | "bring-own"
  >("change-jewelry");
  const [selectedJewelryTier, setSelectedJewelryTier] =
    useState<JewelryTier>("basic");
  const [selectedJewelryCode, setSelectedJewelryCode] = useState<string | null>(
    null
  );
  const [brokenJewelryCodes, setBrokenJewelryCodes] = useState<Set<string>>(
    () => new Set()
  );
  const [jewelryItems, setJewelryItems] = useState<JewelryStoreItem[]>([]);
  const [jewelryLoading, setJewelryLoading] = useState(false);
  const [jewelryError, setJewelryError] = useState<string | null>(null);
  const [aftercareKit, setAftercareKit] = useState(false);
  const [notes, setNotes] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const apiConfigured = getBookingV1Base().length > 0;
  const {
    availableDates,
    availableTimeSlots,
    datesLoading,
    timesLoading,
    scheduleError,
    scheduleUsable,
    scheduleDevMock,
    scheduleMode,
  } = useBookingSchedule("piercing", date);

  const selectedUsageAreas = useMemo(() => {
    const out = new Set<JewelryUsageArea>();
    for (const id of selectedPiercingIds) {
      const def = getPiercingSelectionDef(id);
      if (!def) continue;
      if (def.image === "face-body") out.add("face-and-body");
      else if (def.image === "lips") out.add("lips");
      else if (def.image === "ears") out.add("ear");
    }
    return out;
  }, [selectedPiercingIds]);

  const filteredJewelryItems = useMemo(() => {
    return jewelryItems.filter(
      (item) =>
        item.tier === selectedJewelryTier &&
        item.usage_areas.some((area) => selectedUsageAreas.has(area))
    );
  }, [jewelryItems, selectedJewelryTier, selectedUsageAreas]);

  const visibleJewelryItems = useMemo(
    () => filteredJewelryItems.filter((item) => !brokenJewelryCodes.has(item.code)),
    [filteredJewelryItems, brokenJewelryCodes]
  );

  const totals = useMemo(() => {
    let service = 0;
    for (const id of selectedPiercingIds) {
      service += getPiercingPriceCadById(id);
    }
    const jewelry =
      jewelryChoice === "change-jewelry"
        ? JEWELRY_TIER_PRICE_CAD[selectedJewelryTier]
        : 0;
    const aftercare = aftercareKit ? PIERCING_AFTERCARE_KIT_PRICE_CAD : 0;
    const subtotal = service + jewelry + aftercare;
    const tax = subtotal * SALES_TAX_RATE;
    return {
      serviceFeeCad: service,
      jewelryCad: jewelry,
      aftercareCad: aftercare,
      subtotalCad: subtotal,
      taxCad: tax,
      totalCad: subtotal + tax,
    };
  }, [selectedPiercingIds, jewelryChoice, selectedJewelryTier, aftercareKit]);

  const togglePiercing = (id: string) => {
    setSelectedPiercingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!date) {
      setTime("");
      return;
    }
    if (
      time &&
      !timesLoading &&
      availableTimeSlots.every((s) => s.time !== time)
    ) {
      setTime("");
    }
  }, [date, time, timesLoading, availableTimeSlots]);

  useEffect(() => {
    if (step < 3) return;
    let cancelled = false;
    setJewelryLoading(true);
    setJewelryError(null);
    void fetchJewelryStoreItems()
      .then((items) => {
        if (cancelled) return;
        setJewelryItems(items);
      })
      .catch(() => {
        if (cancelled) return;
        setJewelryError("Could not load jewelry options right now.");
      })
      .finally(() => {
        if (cancelled) return;
        setJewelryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step]);

  useEffect(() => {
    if (jewelryChoice !== "change-jewelry") return;
    if (!selectedJewelryCode) return;
    const exists = filteredJewelryItems.some((j) => j.code === selectedJewelryCode);
    if (!exists) setSelectedJewelryCode(null);
  }, [jewelryChoice, selectedJewelryCode, filteredJewelryItems]);

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

    const payload: PiercingBookingStep1Values = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      termsAccepted,
      recaptchaToken: null,
    };
    setStep1(payload);
    onStep1Continue?.(payload);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (selectedPiercingIds.length === 0) return;
    setStep(3);
  };

  const handleStep3Next = () => {
    if (jewelryChoice === "change-jewelry" && !selectedJewelryCode) return;
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (
      !step1 ||
      selectedPiercingIds.length === 0 ||
      (jewelryChoice === "change-jewelry" && !selectedJewelryCode)
    ) {
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    let recaptchaToken: string | null = null;
    if (RECAPTCHA_SITE_KEY && executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha("booking_piercing");
      } catch {
        setSubmitError("Could not verify reCAPTCHA. Please try again.");
        setSubmitting(false);
        return;
      }
      if (!recaptchaToken) {
        setSubmitError("Could not verify reCAPTCHA. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    const totalCad = totals.totalCad;
    const selectedPiercingLines = selectedPiercingIds.map((id) => {
      const def = getPiercingSelectionDef(id);
      return {
        id,
        label: def?.label ?? id,
        price_cad: getPiercingPriceCadById(id),
      };
    });
    const selectedJewelryDetails =
      jewelryChoice === "change-jewelry"
        ? {
            choice: jewelryChoice,
            tier: selectedJewelryTier,
            code: selectedJewelryCode,
            fee_cad: totals.jewelryCad,
          }
        : {
            choice: jewelryChoice,
            tier: null,
            code: null,
            fee_cad: 0,
          };
    const wizardPayload: PiercingBookingWizardPayload = {
      ...step1,
      piercingIds: selectedPiercingIds,
      jewelryChoice,
      jewelryTier: jewelryChoice === "change-jewelry" ? selectedJewelryTier : null,
      jewelryCode: jewelryChoice === "change-jewelry" ? selectedJewelryCode : null,
      piercingTypeId: "multi",
      jewelryId:
        jewelryChoice === "change-jewelry"
          ? (selectedJewelryCode ?? "change-jewelry")
          : "bring-own",
      aftercareKit,
      notes: notes.trim(),
      totalCad,
    };

    const productId = piercingProductId();
    const body: Record<string, unknown> = {
      full_name: step1.fullName,
      email: step1.email,
      customer_email: step1.email,
      phone: step1.phone,
      booking_date: step1.date,
      booking_time: step1.time,
      terms_accepted: step1.termsAccepted,
      service: "piercing",
      piercing_type_id: "multi",
      piercing_ids: selectedPiercingIds,
      jewelry_id:
        jewelryChoice === "change-jewelry"
          ? (selectedJewelryCode ?? "change-jewelry")
          : "bring-own",
      jewelry_choice: jewelryChoice,
      jewelry_tier:
        jewelryChoice === "change-jewelry" ? selectedJewelryTier : undefined,
      jewelry_code:
        jewelryChoice === "change-jewelry" ? selectedJewelryCode : undefined,
      jewelry_fee_cad: totals.jewelryCad,
      piercing_lines: selectedPiercingLines,
      jewelry_details: selectedJewelryDetails,
      aftercare_kit: aftercareKit,
      notes: notes.trim() || undefined,
      subtotal_cad: totals.subtotalCad,
      tax_rate: SALES_TAX_RATE,
      tax_cad: totals.taxCad,
      estimated_total_cad: totalCad,
      send_customer_confirmation_email: true,
      notify_piercer_email: PIERCER_NOTIFICATION_EMAIL,
    };
    if (recaptchaToken) {
      body.recaptcha_token = recaptchaToken;
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

  const resetWizard = () => {
    setPhase("wizard");
    setStep(1);
    setStep1(null);
    setSelectedPiercingIds([]);
    setJewelryChoice("change-jewelry");
    setSelectedJewelryTier("basic");
    setSelectedJewelryCode(null);
    setBrokenJewelryCodes(new Set());
    setAftercareKit(false);
    setNotes("");
    setSubmitError(null);
    setSubmitting(false);
    setDate("");
    setTime("");
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
          <button
            type="button"
            className="home-btn"
            onClick={resetWizard}
          >
            Book new appointment
          </button>
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

  const progressLabels = ["Details", "Piercings", "Choose jewelry", "Review"] as const;

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
                onChange={(ev) => {
                  setDate(ev.target.value);
                  setTime("");
                }}
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
                  {scheduleMode === "working-hours"
                    ? "No bookable days in the next window — check working hours in the CMS."
                    : "No dates returned. Check shop schedule for piercing in the CMS."}
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
                disabled={
                  !date ||
                  timesLoading ||
                  (!timesLoading && availableTimeSlots.length === 0)
                }
              >
                <option value="">
                  {!date
                    ? "Select a date first"
                    : timesLoading
                      ? "Loading times…"
                      : availableTimeSlots.length === 0
                        ? "No times available"
                        : "Select a time"}
                </option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {slot.time} – {slot.end_time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="recaptcha-terms-row">
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
          <h2 className="booking-wizard__heading booking-wizard__heading--center">
            Piercings
          </h2>
          <p className="booking-wizard__sub booking-wizard__sub--center">
            Choose one or more placements from the list below. All piercings
            are done with a needle, and every tool is sterilized with modern
            equipment according to Vancouver Coastal Health standards.
          </p>
          <PiercingVisualPicker
            selectedIds={selectedPiercingIds}
            onToggle={togglePiercing}
          />
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
              disabled={selectedPiercingIds.length === 0}
              onClick={handleStep2Next}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
      {step === 3 && step1 ? (
        <div className="booking-wizard__panel">
          <h2 className="booking-wizard__heading">Choose jewelry</h2>
          <p className="booking-wizard__sub">
            All Vansun Studio jewelry is implant-grade titanium, highly recommended
            for better healing and trusted by professional piercing standards.
          </p>

          <div className="booking-wizard__options booking-wizard__options--tiers">
            {JEWELRY_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                className={cn(
                  "booking-wizard__option",
                  jewelryChoice === "change-jewelry" &&
                    selectedJewelryTier === tier &&
                    "booking-wizard__option--selected"
                )}
                aria-pressed={
                  jewelryChoice === "change-jewelry" && selectedJewelryTier === tier
                }
                onClick={() => {
                  setJewelryChoice("change-jewelry");
                  setSelectedJewelryTier(tier);
                  setSelectedJewelryCode(null);
                }}
              >
                <span className="booking-wizard__option-title">
                  {jewelryTierLabel(tier)}
                </span>
                <span className="booking-wizard__option-meta">
                  {formatCad(JEWELRY_TIER_PRICE_CAD[tier])}
                </span>
              </button>
            ))}
          </div>

          <div className="booking-wizard__options booking-wizard__options--single-row">
            <button
              type="button"
              className={cn(
                "booking-wizard__option",
                jewelryChoice === "bring-own" && "booking-wizard__option--selected"
              )}
              aria-pressed={jewelryChoice === "bring-own"}
              onClick={() => setJewelryChoice("bring-own")}
            >
              <span className="booking-wizard__option-title">Bring your own jewelry</span>
              <span className="booking-wizard__option-meta">No extra fee</span>
            </button>
          </div>

          {jewelryChoice === "change-jewelry" ? (
            <>
              {jewelryError ? (
                <div className="booking-wizard__error" role="alert">
                  {jewelryError}
                </div>
              ) : null}
              {jewelryLoading ? (
                <p className="booking-wizard__sub">Loading jewelry…</p>
              ) : visibleJewelryItems.length === 0 ? (
                <p className="booking-wizard__sub">
                  For this piercing, this item is currently unavailable.
                </p>
              ) : (
                <div className="booking-wizard__jewelry-grid">
                  {visibleJewelryItems.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={cn(
                        "booking-wizard__jewelry-card",
                        selectedJewelryCode === item.code &&
                          "booking-wizard__jewelry-card--selected"
                      )}
                      onClick={() => setSelectedJewelryCode(item.code)}
                    >
                      <img
                        src={item.image_url}
                        alt={`Jewelry ${item.code}`}
                        className="booking-wizard__jewelry-image"
                        decoding="async"
                        onError={() => {
                          setBrokenJewelryCodes((prev) => {
                            if (prev.has(item.code)) return prev;
                            const next = new Set(prev);
                            next.add(item.code);
                            return next;
                          });
                        }}
                      />
                      <span className="booking-wizard__jewelry-code">{item.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}

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
              disabled={jewelryChoice === "change-jewelry" && !selectedJewelryCode}
              onClick={handleStep3Next}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 && step1 ? (
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
              <span className="booking-wizard__summary-label">Phone</span>
              <span className="booking-wizard__summary-value">{step1.phone}</span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Terms accepted</span>
              <span className="booking-wizard__summary-value">
                {step1.termsAccepted ? "Yes" : "No"}
              </span>
            </li>
            <li className="booking-wizard__summary-row booking-wizard__summary-row--block">
              <span className="booking-wizard__summary-label">Piercings</span>
              <ul className="booking-wizard__piercing-lines">
                {selectedPiercingIds.map((id) => {
                  const def = getPiercingSelectionDef(id);
                  const label = def?.label ?? id;
                  return (
                    <li key={id} className="booking-wizard__piercing-line">
                      <span>{label}</span>
                      <span>{formatCad(getPiercingPriceCadById(id))}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Jewelry</span>
              <span className="booking-wizard__summary-value">
                {jewelryChoice === "change-jewelry"
                  ? `${selectedJewelryCode ?? "Selected in step 3"} (${jewelryTierLabel(selectedJewelryTier)})`
                  : "Bring own jewelry"}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Jewelry option</span>
              <span className="booking-wizard__summary-value">
                {jewelryChoice === "change-jewelry"
                  ? "Studio jewelry"
                  : "Bring your own jewelry"}
              </span>
            </li>
            {jewelryChoice === "change-jewelry" ? (
              <li className="booking-wizard__summary-row">
                <span className="booking-wizard__summary-label">Jewelry tier</span>
                <span className="booking-wizard__summary-value">
                  {jewelryTierLabel(selectedJewelryTier)}
                </span>
              </li>
            ) : null}
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Service fee</span>
              <span className="booking-wizard__summary-value">
                {formatCad(totals.serviceFeeCad)}
              </span>
            </li>
            {totals.jewelryCad > 0 ? (
              <li className="booking-wizard__summary-row">
                <span className="booking-wizard__summary-label">Jewelry fee</span>
                <span className="booking-wizard__summary-value">
                  {formatCad(totals.jewelryCad)}
                </span>
              </li>
            ) : null}
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Subtotal</span>
              <span className="booking-wizard__summary-value">
                {formatCad(totals.subtotalCad)}
              </span>
            </li>
            <li className="booking-wizard__summary-row">
              <span className="booking-wizard__summary-label">Tax</span>
              <span className="booking-wizard__summary-value">
                {formatCad(totals.taxCad)}
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
              <span className="booking-wizard__summary-label">Total</span>
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
                ): saline, instructions, and essentials for healing.
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
