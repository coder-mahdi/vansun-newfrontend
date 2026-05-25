"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { PiercingVisualPicker } from "@/components/booking/PiercingVisualPicker";
import { JEWELRY_TIER_PRICE_CAD } from "@/data/jewelry-tier-pricing";
import { PIERCING_AFTERCARE_KIT_PRICE_CAD } from "@/data/piercing-booking-catalog";
import {
  flattenPiercingQuantities,
  getPiercingPriceCadById,
  getPiercingSelectionDef,
  isPiercingServiceChangeId,
  totalPiercingCount,
} from "@/data/piercings-selection";
import { useBookingSchedule } from "@/hooks/use-booking-schedule";
import { cn } from "@/lib/helpers";
import {
  fetchJewelryStoreItems,
  type JewelryStoreItem,
  type JewelryTier,
  type JewelryUsageArea,
} from "@/lib/jewelry-store-api";
import { getBookingEmailValidationError } from "@/lib/booking-email";
import { getBookingV1Base, postBookingCreate } from "@/lib/booking-v1";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";
import type {
  PiercingBookingStep1Values,
  PiercingBookingWizardPayload,
  PiercingJewelrySlotLine,
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
const SALES_TAX_RATE = 0.12;
const PIERCER_NOTIFICATION_EMAIL = "masiworld93@gmail.com";

function jewelryTierLabel(tier: JewelryTier): string {
  if (tier === "pro-premium") return "Pro premium";
  return tier.slice(0, 1).toUpperCase() + tier.slice(1);
}

type SlotJewelryPick = { tier: JewelryTier; code: string | null };

function filterJewelryForPiercingSlot(
  items: JewelryStoreItem[],
  tier: JewelryTier,
  piercingId: string,
  brokenCodes: Set<string>
): JewelryStoreItem[] {
  if (isPiercingServiceChangeId(piercingId)) return [];
  const def = getPiercingSelectionDef(piercingId);
  const areas = new Set<JewelryUsageArea>();
  if (def) {
    if (def.image === "face-body") areas.add("face-and-body");
    else if (def.image === "lips") areas.add("lips");
    else if (def.image === "ears") areas.add("ear");
  }
  const typeIds = new Set([piercingId]);
  return items.filter((item) => {
    if (brokenCodes.has(item.code)) return false;
    if (item.tier !== tier) return false;
    if (!item.usage_areas.some((area) => areas.has(area))) return false;
    if (item.piercing_type_ids.length === 0) return true;
    return item.piercing_type_ids.some((pid) => typeIds.has(pid));
  });
}

function JewelryImageLightbox({
  urls,
  initialIndex,
  jewelryCode,
  onClose,
}: {
  urls: string[];
  initialIndex: number;
  jewelryCode?: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  const n = urls.length;
  const safeIndex = n === 0 ? 0 : Math.min(Math.max(0, index), n - 1);
  const current = urls[safeIndex] ?? "";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && n > 1) {
        setIndex((i) => (i - 1 + n) % n);
      }
      if (e.key === "ArrowRight" && n > 1) {
        setIndex((i) => (i + 1) % n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, onClose]);

  if (n === 0 || !current) return null;

  const alt =
    n <= 1
      ? jewelryCode
        ? `Jewelry ${jewelryCode} - enlarged photo`
        : "Jewelry - enlarged photo"
      : jewelryCode
        ? `Jewelry ${jewelryCode} - photo ${safeIndex + 1} of ${n}`
        : `Jewelry photo ${safeIndex + 1} of ${n}`;

  return (
    <div
      className="booking-wizard__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Jewelry photos"
    >
      <button
        type="button"
        className="booking-wizard__lightbox-backdrop"
        aria-label="Close photo viewer"
        onClick={onClose}
      />
      <div className="booking-wizard__lightbox-inner">
        <button
          type="button"
          className="booking-wizard__lightbox-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        {n > 1 ? (
          <button
            type="button"
            className="booking-wizard__lightbox-nav booking-wizard__lightbox-nav--prev"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + n) % n);
            }}
          >
            ‹
          </button>
        ) : null}
        <img
          src={current}
          alt={alt}
          className="booking-wizard__lightbox-img"
          decoding="async"
        />
        {n > 1 ? (
          <button
            type="button"
            className="booking-wizard__lightbox-nav booking-wizard__lightbox-nav--next"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % n);
            }}
          >
            ›
          </button>
        ) : null}
        {n > 1 ? (
          <p className="booking-wizard__lightbox-counter">
            {safeIndex + 1} / {n}
          </p>
        ) : null}
      </div>
    </div>
  );
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
  const [piercingQuantities, setPiercingQuantities] = useState<
    Record<string, number>
  >({});

  const expandedPiercingIds = useMemo(
    () => flattenPiercingQuantities(piercingQuantities),
    [piercingQuantities]
  );
  const piercingIdsNeedingJewelry = useMemo(
    () => expandedPiercingIds.filter((id) => !isPiercingServiceChangeId(id)),
    [expandedPiercingIds]
  );
  const slotsFingerprint = useMemo(
    () => expandedPiercingIds.join("\0"),
    [expandedPiercingIds]
  );
  const [jewelryChoice, setJewelryChoice] = useState<
    "change-jewelry" | "bring-own"
  >("change-jewelry");
  const [jewelryBySlot, setJewelryBySlot] = useState<SlotJewelryPick[]>([]);
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
  const [emailError, setEmailError] = useState<string | null>(null);

  const [jewelryLightbox, setJewelryLightbox] = useState<{
    urls: string[];
    index: number;
    code?: string;
  } | null>(null);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);
  const successMessageRef = useRef<HTMLDivElement | null>(null);

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

  const catalogUsesPiercingTypeFilter = useMemo(
    () => jewelryItems.some((i) => i.piercing_type_ids.length > 0),
    [jewelryItems]
  );

  const jewelryBySlotAligned = useMemo((): SlotJewelryPick[] => {
    return expandedPiercingIds.map(
      (_, i) => jewelryBySlot[i] ?? { tier: "basic", code: null }
    );
  }, [expandedPiercingIds, jewelryBySlot]);

  const totals = useMemo(() => {
    let service = 0;
    for (const [id, qty] of Object.entries(piercingQuantities)) {
      const n = Math.max(0, Math.floor(qty));
      if (n <= 0) continue;
      service += getPiercingPriceCadById(id) * n;
    }
    let jewelry = 0;
    if (jewelryChoice === "change-jewelry") {
      for (const pick of jewelryBySlotAligned) {
        jewelry += JEWELRY_TIER_PRICE_CAD[pick.tier];
      }
    }
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
  }, [piercingQuantities, jewelryChoice, jewelryBySlotAligned, aftercareKit]);

  const incrementPiercing = (id: string) => {
    setPiercingQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  };

  const decrementPiercing = (id: string) => {
    setPiercingQuantities((prev) => {
      const next = { ...prev };
      const q = (next[id] ?? 0) - 1;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  };

  const updateSlotJewelry = (index: number, patch: Partial<SlotJewelryPick>) => {
    setJewelryBySlot((prev) => {
      const next = expandedPiercingIds.map(
        (_, j) => prev[j] ?? { tier: "basic" as JewelryTier, code: null }
      );
      next[index] = { ...next[index], ...patch };
      return next;
    });
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
    if (step !== 3) setJewelryLightbox(null);
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;
    if (piercingIdsNeedingJewelry.length === 0) {
      setJewelryChoice("bring-own");
    }
  }, [step, piercingIdsNeedingJewelry.length]);

  useEffect(() => {
    if (phase !== "wizard") return;
    if (step === 1) return;
    wizardTopRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [step, phase]);

  useEffect(() => {
    if (phase !== "success") return;
    successMessageRef.current?.scrollIntoView({
      block: "start",
      behavior: "auto",
    });
  }, [phase]);

  useEffect(() => {
    const ids =
      slotsFingerprint.length > 0 ? slotsFingerprint.split("\0") : [];

    if (jewelryChoice !== "change-jewelry") {
      setJewelryBySlot((prev) => {
        const next = ids.map(() => ({
          tier: "basic" as JewelryTier,
          code: null,
        }));
        if (
          next.length === prev.length &&
          next.every(
            (s, i) => s.code === prev[i]?.code && s.tier === prev[i]?.tier
          )
        ) {
          return prev;
        }
        return next;
      });
      return;
    }

    setJewelryBySlot((prev) => {
      const base =
        ids.length !== prev.length
          ? ids.map(() => ({ tier: "basic" as JewelryTier, code: null }))
          : ids.map(
              (_, i) =>
                prev[i] ?? { tier: "basic" as JewelryTier, code: null }
            );

      const next = base.map((slot, i) => {
        const pid = ids[i] ?? "";
        if (!pid) return slot;
        const visible = filterJewelryForPiercingSlot(
          jewelryItems,
          slot.tier,
          pid,
          brokenJewelryCodes
        );
        if (slot.code && !visible.some((j) => j.code === slot.code)) {
          return { ...slot, code: null };
        }
        return slot;
      });

      if (
        next.length === prev.length &&
        next.every(
          (s, i) => s.code === prev[i]?.code && s.tier === prev[i]?.tier
        )
      ) {
        return prev;
      }
      return next;
    });
  }, [slotsFingerprint, jewelryItems, brokenJewelryCodes, jewelryChoice]);

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

    const emailValidation = getBookingEmailValidationError(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    setEmailError(null);

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
    if (totalPiercingCount(piercingQuantities) === 0) return;
    setStep(3);
  };

  const jewelrySlotsIncomplete =
    jewelryChoice === "change-jewelry" &&
    expandedPiercingIds.some(
      (id, i) =>
        !isPiercingServiceChangeId(id) && !jewelryBySlotAligned[i]?.code
    );

  const handleStep3Next = () => {
    if (jewelrySlotsIncomplete) return;
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (
      !step1 ||
      totalPiercingCount(piercingQuantities) === 0 ||
      jewelrySlotsIncomplete
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
    const selectedPiercingLines = Object.entries(piercingQuantities)
      .filter(([, q]) => q > 0)
      .map(([id, quantity]) => {
        const def = getPiercingSelectionDef(id);
        const unit = getPiercingPriceCadById(id);
        return {
          id,
          label: def?.label ?? id,
          quantity,
          unit_price_cad: unit,
          line_total_cad: unit * quantity,
        };
      });

    const jewelrySlotsResolved: PiercingJewelrySlotLine[] =
      jewelryChoice === "change-jewelry"
        ? expandedPiercingIds.map((piercingId, i) => {
            const pick = jewelryBySlotAligned[i]!;
            const code = pick.code!;
            const item = jewelryItems.find((j) => j.code === code);
            return {
              piercingId,
              tier: pick.tier,
              code,
              imageUrl: item?.image_url?.trim() || null,
              feeCad: JEWELRY_TIER_PRICE_CAD[pick.tier],
            };
          })
        : [];

    const jewelryImageUrl = jewelrySlotsResolved[0]?.imageUrl ?? null;
    const jewelryCodeJoined =
      jewelrySlotsResolved.length > 0
        ? jewelrySlotsResolved.map((s) => s.code).join(", ")
        : null;
    const primaryJewelryCode = jewelrySlotsResolved[0]?.code ?? null;
    const primaryJewelryTier = jewelrySlotsResolved[0]?.tier ?? null;

    const selectedJewelryDetails =
      jewelryChoice === "change-jewelry"
        ? {
            choice: jewelryChoice,
            fee_cad: totals.jewelryCad,
            slots: jewelrySlotsResolved.map((s) => ({
              piercing_id: s.piercingId,
              tier: s.tier,
              code: s.code,
              fee_cad: s.feeCad,
              image_url: s.imageUrl,
            })),
            tier: primaryJewelryTier,
            code: primaryJewelryCode,
            image_url: jewelryImageUrl,
          }
        : {
            choice: jewelryChoice,
            tier: null,
            code: null,
            fee_cad: 0,
            image_url: null,
            slots: [],
          };

    const jewelryIdForApi =
      jewelryChoice === "change-jewelry"
        ? jewelrySlotsResolved.length > 1
          ? "multi-slot"
          : (primaryJewelryCode ?? "change-jewelry")
        : "bring-own";

    const wizardPayload: PiercingBookingWizardPayload = {
      ...step1,
      piercingQuantities: Object.fromEntries(
        Object.entries(piercingQuantities).filter(([, q]) => q > 0)
      ),
      piercingIds: expandedPiercingIds,
      jewelryChoice,
      jewelryTier: primaryJewelryTier,
      jewelryCode: jewelryCodeJoined,
      jewelrySlots:
        jewelryChoice === "change-jewelry" ? jewelrySlotsResolved : null,
      jewelryImageUrl,
      piercingTypeId: "multi",
      jewelryId: jewelryIdForApi,
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
      piercing_ids: expandedPiercingIds,
      piercing_quantities: Object.fromEntries(
        Object.entries(piercingQuantities).filter(([, q]) => q > 0)
      ),
      jewelry_id: jewelryIdForApi,
      jewelry_choice: jewelryChoice,
      jewelry_tier: primaryJewelryTier ?? undefined,
      jewelry_code: jewelryCodeJoined ?? undefined,
      jewelry_codes: jewelrySlotsResolved.map((s) => s.code),
      jewelry_slots: jewelrySlotsResolved.map((s) => ({
        piercing_id: s.piercingId,
        tier: s.tier,
        code: s.code,
        fee_cad: s.feeCad,
        image_url: s.imageUrl,
      })),
      jewelry_image_url:
        jewelryChoice === "change-jewelry" && jewelryImageUrl
          ? jewelryImageUrl
          : undefined,
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
    setPiercingQuantities({});
    setJewelryChoice("change-jewelry");
    setJewelryBySlot([]);
    setBrokenJewelryCodes(new Set());
    setAftercareKit(false);
    setNotes("");
    setSubmitError(null);
    setSubmitting(false);
    setEmailError(null);
    setDate("");
    setTime("");
    setJewelryLightbox(null);
  };

  if (phase === "success") {
    return (
      <div
        ref={successMessageRef}
        className={cn("booking-page__success-message", className)}
      >
        <p>
          Your piercing appointment request was received.
          <br />
          <br />
          If you need to cancel, please email us at least 1 hour before your
          scheduled time.
        </p>
        <div className="success-buttons">
          <button
            type="button"
            className="home-btn"
            onClick={resetWizard}
          >
            Book again
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
    <div ref={wizardTopRef} className={className}>
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
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  setEmailError(null);
                }}
                placeholder="Enter your email"
                required
                autoComplete="email"
                aria-invalid={emailError ? true : undefined}
                aria-describedby={
                  emailError ? "piercing-email-error" : undefined
                }
              />
              {emailError ? (
                <p id="piercing-email-error" className="booking-form-field-error">
                  {emailError}
                </p>
              ) : null}
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
                    ? "No bookable days in the next window. Check working hours in the CMS."
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
                    {slot.time} - {slot.end_time}
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
            Choose placements from the list below. Tap again or use + for a
            second piercing of the same type (for example both nipples or
            paired lip piercings). All piercings are done with a needle, and
            every tool is sterilized with modern equipment according to
            Vancouver Coastal Health standards.{" "}
            <Link
              href="/piercing/price-list"
              className="piercing-price-list-inline-link"
            >
              Piercing price list
            </Link>
            .
          </p>
          <PiercingVisualPicker
            quantities={piercingQuantities}
            onIncrement={incrementPiercing}
            onDecrement={decrementPiercing}
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
              disabled={totalPiercingCount(piercingQuantities) === 0}
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
            {expandedPiercingIds.length > 1
              ? `You selected ${expandedPiercingIds.length} piercings. For each one below, choose a tier and a studio piece, in order. Each line has its own fee.`
              : "Choose a jewelry price tier, then pick the studio piece you want for this piercing."}
          </p>

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
              <div className="booking-wizard__jewelry-field">
                <p className="booking-wizard__jewelry-field-label">Studio jewelry</p>
                <p className="booking-wizard__jewelry-field-hint booking-wizard__jewelry-field-hint--tier">
                  Pick a tier and matching catalog piece for each piercing. Tiers can differ per piercing.
                </p>
              </div>
              {jewelryError ? (
                <div className="booking-wizard__error" role="alert">
                  {jewelryError}
                </div>
              ) : null}
              {jewelryLoading ? (
                <p className="booking-wizard__sub">Loading jewelry…</p>
              ) : jewelryItems.length === 0 ? (
                <p className="booking-wizard__sub">
                  {getBookingV1Base()
                    ? "No studio jewelry is available to choose yet, or the list could not be loaded."
                    : "Studio jewelry is unavailable because the booking API URL is not configured."}
                </p>
              ) : (
                expandedPiercingIds.map((piercingId, slotIndex) => {
                  if (isPiercingServiceChangeId(piercingId)) {
                    const def = getPiercingSelectionDef(piercingId);
                    return (
                      <p
                        key={`${piercingId}-${slotIndex}`}
                        className="booking-wizard__sub booking-wizard__jewelry-slot-skip"
                      >
                        {def?.label ?? piercingId}: studio jewelry selection is not
                        required for this service.
                      </p>
                    );
                  }
                  const pick =
                    jewelryBySlotAligned[slotIndex] ?? {
                      tier: "basic" as JewelryTier,
                      code: null,
                    };
                  const visibleForSlot = filterJewelryForPiercingSlot(
                    jewelryItems,
                    pick.tier,
                    piercingId,
                    brokenJewelryCodes
                  );
                  const def = getPiercingSelectionDef(piercingId);
                  const slotLabel = def?.label ?? piercingId;
                  return (
                    <div
                      key={`${piercingId}-${slotIndex}`}
                      className={cn(
                        "booking-wizard__jewelry-slot",
                        slotIndex > 0 && "booking-wizard__jewelry-slot--follow"
                      )}
                    >
                      <p className="booking-wizard__jewelry-field-label">
                        Piercing {slotIndex + 1} of {expandedPiercingIds.length}:{" "}
                        {slotLabel}
                      </p>
                      <div className="booking-wizard__options booking-wizard__options--tiers">
                        {JEWELRY_TIERS.map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            className={cn(
                              "booking-wizard__option",
                              pick.tier === tier && "booking-wizard__option--selected"
                            )}
                            aria-pressed={pick.tier === tier}
                            onClick={() => {
                              setJewelryChoice("change-jewelry");
                              updateSlotJewelry(slotIndex, {
                                tier,
                                code: null,
                              });
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
                      {visibleForSlot.length === 0 ? (
                        <p className="booking-wizard__sub">
                          {catalogUsesPiercingTypeFilter
                            ? "No jewelry in this tier matches this placement and catalog tags. Try another tier, or adjust piercings in the previous step."
                            : "No jewelry in the catalog matches this placement for the tier you selected. Try another tier, or ask the studio to tag pieces in WordPress."}
                        </p>
                      ) : (
                        <div className="booking-wizard__jewelry-grid">
                          {visibleForSlot.map((item) => (
                            <div
                              key={`${slotIndex}-${item.code}`}
                              className={cn(
                                "booking-wizard__jewelry-card",
                                pick.code === item.code &&
                                  "booking-wizard__jewelry-card--selected"
                              )}
                            >
                              <button
                                type="button"
                                className="booking-wizard__jewelry-card-main"
                                onClick={() => {
                                  setJewelryChoice("change-jewelry");
                                  updateSlotJewelry(slotIndex, {
                                    code: item.code,
                                  });
                                }}
                              >
                                <div className="booking-wizard__jewelry-image-wrap">
                                  <Image
                                    src={item.image_url}
                                    alt={`Jewelry ${item.code}`}
                                    fill
                                    className="booking-wizard__jewelry-image"
                                    sizes="(max-width: 859px) 45vw, 28vw"
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
                                </div>
                                <div className="booking-wizard__jewelry-code">
                                  <span className="booking-wizard__jewelry-code-label">
                                    Jewelry code
                                  </span>
                                  <span className="booking-wizard__jewelry-code-value">
                                    {item.code}
                                  </span>
                                </div>
                              </button>
                              {item.gallery_urls.length > 0 ? (
                                <div className="booking-wizard__jewelry-thumbs">
                                  {item.gallery_urls.map((url, gi) => (
                                    <button
                                      key={`${slotIndex}-${item.code}-g-${gi}`}
                                      type="button"
                                      className="booking-wizard__jewelry-thumb"
                                      aria-label={`Larger photo ${gi + 2} for ${item.code}`}
                                      onClick={() =>
                                        setJewelryLightbox({
                                          urls: [
                                            item.image_url,
                                            ...item.gallery_urls,
                                          ],
                                          index: gi + 1,
                                          code: item.code,
                                        })
                                      }
                                    >
                                      <span className="booking-wizard__jewelry-thumb-pad">
                                        <Image
                                          src={url}
                                          alt={`Jewelry ${item.code}, extra photo ${gi + 2}`}
                                          fill
                                          className="booking-wizard__jewelry-thumb-img"
                                          sizes="44px"
                                          decoding="async"
                                        />
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          ) : null}

          {jewelryLightbox ? (
            <JewelryImageLightbox
              key={`${jewelryLightbox.urls.join("|")}-${jewelryLightbox.index}`}
              urls={jewelryLightbox.urls}
              initialIndex={jewelryLightbox.index}
              jewelryCode={jewelryLightbox.code}
              onClose={() => setJewelryLightbox(null)}
            />
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
              disabled={jewelrySlotsIncomplete}
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
            <li className="booking-wizard__summary-row booking-wizard__summary-row--contact-stack">
              <span className="booking-wizard__summary-label">Contact</span>
              <div className="booking-wizard__summary-contact-block">
                <span className="booking-wizard__summary-contact-name">
                  {step1.fullName}
                </span>
                <span className="booking-wizard__summary-contact-email">
                  {step1.email}
                </span>
              </div>
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
                {Object.entries(piercingQuantities)
                  .filter(([, q]) => q > 0)
                  .map(([id, qty]) => {
                    const def = getPiercingSelectionDef(id);
                    const label = def?.label ?? id;
                    const unit = getPiercingPriceCadById(id);
                    return (
                      <li key={id} className="booking-wizard__piercing-line">
                        <span>
                          {label}
                          {qty > 1 ? ` × ${qty}` : ""}
                        </span>
                        <span>{formatCad(unit * qty)}</span>
                      </li>
                    );
                  })}
              </ul>
            </li>
            <li className="booking-wizard__summary-row booking-wizard__summary-row--block">
              <span className="booking-wizard__summary-label">Jewelry</span>
              <ul className="booking-wizard__piercing-lines">
                {jewelryChoice === "change-jewelry"
                  ? expandedPiercingIds.map((piercingId, slotIndex) => {
                      const pick = jewelryBySlotAligned[slotIndex];
                      const def = getPiercingSelectionDef(piercingId);
                      const label = def?.label ?? piercingId;
                      const tierFee = pick
                        ? JEWELRY_TIER_PRICE_CAD[pick.tier]
                        : 0;
                      const tierLabel = pick ? jewelryTierLabel(pick.tier) : "";
                      const code = pick?.code;
                      return (
                        <li
                          key={`jewelry-line-${piercingId}-${slotIndex}`}
                          className="booking-wizard__piercing-line"
                        >
                          <span>
                            #{slotIndex + 1} {label}
                            {code
                              ? ` · ${tierLabel} · code ${code}`
                              : ` · ${tierLabel}`}
                          </span>
                          <span>{formatCad(tierFee)}</span>
                        </li>
                      );
                    })
                  : (
                    <li className="booking-wizard__piercing-line">
                      <span>Bring your own jewelry</span>
                      <span>-</span>
                    </li>
                  )}
              </ul>
            </li>
            {aftercareKit ? (
              <li className="booking-wizard__summary-row booking-wizard__summary-row--block">
                <span className="booking-wizard__summary-label">Aftercare</span>
                <ul className="booking-wizard__piercing-lines">
                  <li className="booking-wizard__piercing-line">
                    <span>Aftercare kit</span>
                    <span>{formatCad(PIERCING_AFTERCARE_KIT_PRICE_CAD)}</span>
                  </li>
                </ul>
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
                <span className="booking-wizard__aftercare-strong">
                  Highly recommended.{" "}
                </span>
                add aftercare kit ({formatCad(PIERCING_AFTERCARE_KIT_PRICE_CAD)}
                ): saline, instructions, and essentials for a smoother healing
                process.
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
