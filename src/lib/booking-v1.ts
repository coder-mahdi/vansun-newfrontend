/**
 * Vansun WP plugin (`vansun-core`) REST base: `/wp-json/vansun/v1`.
 *
 * - Working hours: `GET /working-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` (see `Vansun_Working_Hours_Api`).
 * - Legacy (if implemented): `shop-schedule/available-dates`, `available-times`.
 * - Occupancy: `GET /shop-schedule/booked-slots?date=YYYY-MM-DD&service_type=tattoo|piercing`.
 * - Booking create: `POST /booking/create` (when registered).
 *
 * Set `NEXT_PUBLIC_BOOKING_API_URL` to override the base. Otherwise uses
 * `NEXT_PUBLIC_CMS_API_URL` origin, or if unset `NEXT_PUBLIC_CMS_SITE_URL` (same host as your CMS),
 * + `/wp-json/vansun/v1`.
 *
 * Optional: `NEXT_PUBLIC_BOOKING_OCCUPANCY_BASE`, same shape as the booking base, but used only
 * for `GET /shop-schedule/booked-slots` when occupancy lives on a different URL than the rest.
 *
 * Optional: `NEXT_PUBLIC_BOOKING_BOOKED_SLOTS_DIRECT=1`, skip the Next.js proxy and call the CMS
 * URL only from the browser (default is proxy-first in the browser).
 *
 * Optional: `NEXT_PUBLIC_BOOKING_LIST_API_PATH`, extra vansun v1 path (e.g. `/bookings/by-date`)
 * that returns JSON parseable by {@link parseBookedSlotStartsPayload}; merged with booked-slots
 * so occupied times from the booking list are always applied when that route exists.
 */

import { getCmsApiOrigin } from "@/lib/cms-wordpress";
import {
  mergeOccupiedSlotStartsLists,
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

const VANSUN_V1_PATH = "/wp-json/vansun/v1";

/**
 * Accepts either a site origin (`https://cms.example.com`) or a URL that already
 * ends with `/wp-json/vansun/v1` (some teams set `NEXT_PUBLIC_CMS_API_URL` that way).
 * Always returns a single canonical vansun v1 base (no doubled `/wp-json/...`).
 */
function normalizeToVansunV1Base(raw: string): string {
  const t = trimTrailingSlash(raw.trim());
  if (!t) return "";
  const lower = t.toLowerCase();
  const idx = lower.indexOf(VANSUN_V1_PATH);
  if (idx !== -1) {
    return t.slice(0, idx + VANSUN_V1_PATH.length);
  }
  return `${t}${VANSUN_V1_PATH}`;
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
  if (explicit) return normalizeToVansunV1Base(explicit);
  const cms = originForBookingRest();
  if (!cms) return "";
  return normalizeToVansunV1Base(cms);
}

/**
 * Optional: same vansun v1 root as {@link getBookingV1Base} but on another host/path
 * if occupancy is deployed separately. Otherwise falls back to `getBookingV1Base()`.
 */
export function getBookingOccupancyV1Base(): string {
  const occ = process.env.NEXT_PUBLIC_BOOKING_OCCUPANCY_BASE?.trim();
  if (occ) return normalizeToVansunV1Base(occ);
  return getBookingV1Base();
}

/** Full URL for `GET /shop-schedule/booked-slots` (used by client fetch and Next proxy). */
export function buildShopBookedSlotsUrl(
  date: string,
  serviceType: "tattoo" | "piercing" | undefined,
  base: string
): string {
  const root = trimTrailingSlash(base.trim());
  let q = `date=${encodeURIComponent(date)}`;
  if (serviceType === "tattoo" || serviceType === "piercing") {
    q += `&service_type=${encodeURIComponent(serviceType)}`;
  }
  return `${root}/shop-schedule/booked-slots?${q}`;
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
 * GET `/working-hours?from=YYYY-MM-DD&to=YYYY-MM-DD`, vansun-core plugin
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
 * GET `/shop-schedule/booked-slots?date=YYYY-MM-DD&service_type=tattoo|piercing`
 * Start times (HH:MM) of existing 30-minute slots already taken for that day.
 * With `serviceType`, only bookings for that service are returned so tattoo and piercing
 * calendars can offer the same clock time independently.
 *
 * Returns null if the request fails (caller may still show slots from working hours only).
 *
 * In the browser, first calls the same-origin Next route `GET /api/booking/booked-slots`
 * so the CMS is hit from the server (no CORS / odd browser blocks on `booked-slots` only).
 * Set `NEXT_PUBLIC_BOOKING_BOOKED_SLOTS_DIRECT=1` to skip the proxy and only call the CMS URL.
 */
export async function fetchShopBookedSlotStartsForDate(
  date: string,
  serviceType?: "tattoo" | "piercing"
): Promise<string[] | null> {
  const primary = getBookingOccupancyV1Base();
  const fallback = getBookingV1Base();
  const bases =
    primary && fallback && primary !== fallback ? [primary, fallback] : [primary || fallback];
  if (!bases[0]) return null;

  const svc =
    serviceType === "tattoo" || serviceType === "piercing" ? serviceType : undefined;
  let query = `date=${encodeURIComponent(date)}`;
  if (svc) query += `&service_type=${encodeURIComponent(svc)}`;

  const skipProxy =
    process.env.NEXT_PUBLIC_BOOKING_BOOKED_SLOTS_DIRECT === "1" ||
    process.env.NEXT_PUBLIC_BOOKING_BOOKED_SLOTS_DIRECT === "true";

  const tryParseBody = (data: unknown): string[] | null => {
    if (!data || typeof data !== "object") return null;
    const err = data as Record<string, unknown>;
    if (
      err.code === "rest_no_route" ||
      err.code === "rest_forbidden" ||
      err.code === "rest_not_found"
    ) {
      return null;
    }
    return parseBookedSlotStartsPayload(data);
  };

  const fetchOneUrl = async (url: string): Promise<string[] | null> => {
    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const raw = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(raw) as unknown;
      } catch {
        return null;
      }
      if (!res.ok) return null;
      return tryParseBody(data);
    } catch {
      return null;
    }
  };

  const fetchListPathOccupancy = async (): Promise<string[] | null> => {
    const listPath = process.env.NEXT_PUBLIC_BOOKING_LIST_API_PATH?.trim();
    if (!listPath) return null;
    const p = listPath.startsWith("/") ? listPath : `/${listPath}`;
    for (const base of bases) {
      if (!base) continue;
      const url = `${trimTrailingSlash(base)}${p}?${query}`;
      const got = await fetchOneUrl(url);
      if (got !== null) return got;
    }
    return null;
  };

  if (typeof window !== "undefined" && !skipProxy) {
    const viaProxy = await fetchOneUrl(`/api/booking/booked-slots?${query}`);
    if (viaProxy !== null) return viaProxy;
  }

  let fromBookedSlots: string[] | null = null;
  for (const base of bases) {
    if (!base) continue;
    const url = buildShopBookedSlotsUrl(date, svc, base);
    fromBookedSlots = await fetchOneUrl(url);
    if (fromBookedSlots !== null) break;
  }

  const fromBookingList = await fetchListPathOccupancy();
  return mergeOccupiedSlotStartsLists(fromBookedSlots, fromBookingList);
}

/**
 * Same as {@link fetchShopBookedSlotStartsForDate}: reads **registered bookings** from WordPress
 * (`vansun_booking` posts) through `GET …/shop-schedule/booked-slots` and returns occupied slot
 * starts (HH:MM). The CPT is not `show_in_rest`; this route is how the front end is meant to
 * mirror the admin booking list for a given day (optionally scoped by `service_type`).
 */
export const fetchRegisteredBookingsOccupiedStarts = fetchShopBookedSlotStartsForDate;

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
