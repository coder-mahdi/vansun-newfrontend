/**
 * Vansun WP plugin (`vansun-core`) REST base: `/wp-json/vansun/v1`.
 *
 * - Working hours: `GET /working-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` (see `Vansun_Working_Hours_Api`).
 * - Legacy (if implemented): `shop-schedule/available-dates`, `available-times`.
 * - Booking create: `POST /booking/create` (when registered).
 *
 * Set `NEXT_PUBLIC_BOOKING_API_URL` to override the base. Otherwise uses
 * `NEXT_PUBLIC_CMS_API_URL` origin, or if unset `NEXT_PUBLIC_CMS_SITE_URL` (same host as your CMS),
 * + `/wp-json/vansun/v1`.
 */

import { getCmsApiOrigin } from "@/lib/cms-wordpress";
import {
  parseBookedSlotStartsPayload,
  type VansunResolvedDayRow,
  type VansunWorkingHoursApiResponse,
} from "@/lib/booking-schedule-from-hours";

export type { VansunResolvedDayRow, VansunWorkingHoursApiResponse } from "@/lib/booking-schedule-from-hours";

function normalizeVansunServiceWindow(
  v: unknown
): { open: string; close: string } | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const open = String(o.open ?? "").trim();
  const close = String(o.close ?? "").trim();
  if (!open || !close) return null;
  return { open, close };
}

function normalizeVansunResolvedDay(row: unknown): VansunResolvedDayRow | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const date = String(o.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const weekday = String(o.weekday ?? "mon").trim();
  return {
    date,
    weekday,
    tattoo: normalizeVansunServiceWindow(o.tattoo),
    piercing: normalizeVansunServiceWindow(o.piercing),
  };
}

function normalizeVansunWorkingHoursPayload(
  data: unknown
): VansunWorkingHoursApiResponse | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const daysRaw = root.days;
  let days: VansunResolvedDayRow[] | undefined;
  if (Array.isArray(daysRaw)) {
    days = daysRaw
      .map(normalizeVansunResolvedDay)
      .filter((x): x is VansunResolvedDayRow => x !== null);
  }
  return {
    timezone: typeof root.timezone === "string" ? root.timezone : undefined,
    weekly: root.weekly,
    exceptions: root.exceptions,
    days,
  };
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** WP REST is on the CMS host; some envs only define `NEXT_PUBLIC_CMS_SITE_URL`. */
function originForBookingRest(): string {
  const api = getCmsApiOrigin();
  if (api) return api;
  const site = process.env.NEXT_PUBLIC_CMS_SITE_URL?.trim();
  return site ? trimTrailingSlash(site) : "";
}

export function getBookingV1Base(): string {
  const explicit = process.env.NEXT_PUBLIC_BOOKING_API_URL?.trim();
  if (explicit) return trimTrailingSlash(explicit);
  const cms = originForBookingRest();
  if (!cms) return "";
  return `${trimTrailingSlash(cms)}/wp-json/vansun/v1`;
}

export type AvailableDateRow = { date: string; day: string };
export type TimeSlotRow = { time: string; end_time: string };

type DatesResponse = {
  success?: boolean;
  dates?: AvailableDateRow[];
};

type TimesResponse = {
  success?: boolean;
  times?: TimeSlotRow[];
};

export async function fetchAvailableBookingDates(
  serviceType: "piercing" | "tattoo"
): Promise<AvailableDateRow[]> {
  const base = getBookingV1Base();
  if (!base) return [];
  const url = `${base}/shop-schedule/available-dates?service_type=${serviceType}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`available-dates failed: ${res.status}`);
  }
  const data = (await res.json()) as DatesResponse;
  if (data.success && Array.isArray(data.dates)) {
    return data.dates;
  }
  return [];
}

export async function fetchAvailableBookingTimes(
  serviceType: "piercing" | "tattoo",
  date: string
): Promise<TimeSlotRow[]> {
  const base = getBookingV1Base();
  if (!base) return [];
  const url = `${base}/shop-schedule/available-times?service_type=${encodeURIComponent(serviceType)}&date=${encodeURIComponent(date)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`available-times failed: ${res.status}`);
  }
  const data = (await res.json()) as TimesResponse;
  if (data.success && Array.isArray(data.times)) {
    return data.times;
  }
  return [];
}

/**
 * GET `/working-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` — vansun-core plugin
 * (`Vansun_Working_Hours_Api`). Returns resolved `days` (exceptions applied) plus `weekly` template.
 * Without `from`/`to`, `days` is omitted; always pass a range for booking UI.
 */
export async function fetchVansunWorkingHours(
  from: string,
  to: string
): Promise<VansunWorkingHoursApiResponse | null> {
  const base = getBookingV1Base();
  if (!base) return null;
  try {
    const url = `${base}/working-hours?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return normalizeVansunWorkingHoursPayload(data);
  } catch {
    return null;
  }
}

/**
 * GET /shop-schedule/booked-slots?date=YYYY-MM-DD
 * Start times (HH:MM) of existing bookings for that day — tattoo and piercing share the studio;
 * both should be listed so a taken 30-minute window is hidden on both flows.
 *
 * Returns null if the request fails (caller may still show slots from working hours only).
 */
export async function fetchShopBookedSlotStartsForDate(
  date: string
): Promise<string[] | null> {
  const base = getBookingV1Base();
  if (!base) return null;
  try {
    const url = `${base}/shop-schedule/booked-slots?date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return parseBookedSlotStartsPayload(data);
  } catch {
    return null;
  }
}

export type BookingCreateResponse = {
  success?: boolean;
  message?: string;
};

/**
 * POST /booking/create: legacy endpoint; extra piercing fields may be ignored until the API supports them.
 */
export async function postBookingCreate(
  body: Record<string, unknown>
): Promise<BookingCreateResponse> {
  const base = getBookingV1Base();
  if (!base) {
    throw new Error("Booking API is not configured.");
  }
  const res = await fetch(`${base}/booking/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: BookingCreateResponse = {};
  try {
    data = (await res.json()) as BookingCreateResponse;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new Error(data.message || `Booking failed (${res.status})`);
  }
  return data;
}
