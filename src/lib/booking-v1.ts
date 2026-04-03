/**
 * Vansun custom WP REST namespace (v1) — shop schedule & booking.
 * Set NEXT_PUBLIC_BOOKING_API_URL to the full base, e.g.
 * https://example.com/cms/wp-json/vansunstudio/v1
 * If unset, falls back to NEXT_PUBLIC_CMS_API_URL + /wp-json/vansunstudio/v1
 */

import { getCmsApiOrigin } from "@/lib/cms-wordpress";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getBookingV1Base(): string {
  const explicit = process.env.NEXT_PUBLIC_BOOKING_API_URL?.trim();
  if (explicit) return trimTrailingSlash(explicit);
  const cms = getCmsApiOrigin();
  if (!cms) return "";
  return `${trimTrailingSlash(cms)}/wp-json/vansunstudio/v1`;
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

export type BookingCreateResponse = {
  success?: boolean;
  message?: string;
};

/**
 * POST /booking/create — legacy endpoint; extra piercing fields may be ignored until the API supports them.
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
