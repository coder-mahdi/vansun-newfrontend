import { NextResponse } from "next/server";
import {
  buildShopBookedSlotsUrl,
  getBookingOccupancyV1Base,
  getBookingV1Base,
} from "@/lib/booking-v1";
import {
  mergeOccupiedSlotStartsLists,
  parseBookedSlotStartsPayload,
} from "@/lib/booking-schedule-from-hours";

export const dynamic = "force-dynamic";

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function isWpRestErrorJson(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  const code = o.code;
  return (
    code === "rest_no_route" ||
    code === "rest_forbidden" ||
    code === "rest_not_found"
  );
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
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
    if (isWpRestErrorJson(data)) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Proxies shop `booked-slots` plus optional `NEXT_PUBLIC_BOOKING_LIST_API_PATH` from the CMS,
 * merges occupied HH:MM so the browser gets one list for the booking store + list endpoints.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? "";
  const stRaw = searchParams.get("service_type");
  const serviceType =
    stRaw === "tattoo" || stRaw === "piercing" ? stRaw : undefined;

  const primary = getBookingOccupancyV1Base();
  const fallback = getBookingV1Base();
  const bases =
    primary && fallback && primary !== fallback
      ? [primary, fallback]
      : [primary || fallback];

  if (!bases[0] || !date) {
    return NextResponse.json(
      { ok: false, message: "missing_base_or_date", booked_starts: [] },
      {
        status: 400,
        headers: { "Cache-Control": "private, no-store, no-cache, must-revalidate" },
      }
    );
  }

  const query = `date=${encodeURIComponent(date)}${
    serviceType ? `&service_type=${encodeURIComponent(serviceType)}` : ""
  }`;

  let primaryPayload: unknown | null = null;
  for (const base of bases) {
    if (!base) continue;
    const url = buildShopBookedSlotsUrl(date, serviceType, base);
    primaryPayload = await fetchJson(url);
    if (primaryPayload !== null) break;
  }

  const fromBookedSlots = primaryPayload
    ? parseBookedSlotStartsPayload(primaryPayload)
    : null;

  let fromBookingList: string[] | null = null;
  const listPath = process.env.NEXT_PUBLIC_BOOKING_LIST_API_PATH?.trim();
  if (listPath) {
    const p = listPath.startsWith("/") ? listPath : `/${listPath}`;
    for (const base of bases) {
      if (!base) continue;
      const url = `${trimSlash(base)}${p}?${query}`;
      const raw = await fetchJson(url);
      if (raw === null) continue;
      fromBookingList = parseBookedSlotStartsPayload(raw);
      if (fromBookingList !== null) break;
    }
  }

  const merged = mergeOccupiedSlotStartsLists(fromBookedSlots, fromBookingList);

  // If we could not parse any source, do not return 200 + [] — that makes the UI think
  // "no bookings" and shows every slot (including taken ones).
  if (merged === null) {
    return NextResponse.json(
      {
        code: "rest_no_route",
        message: "booked-slots upstream unavailable or unparsable",
        booked_starts: [],
      },
      {
        status: 502,
        headers: { "Cache-Control": "private, no-store, no-cache, must-revalidate" },
      }
    );
  }

  const booked_starts = merged;

  return NextResponse.json(
    {
      ok: true,
      date,
      service_type: serviceType ?? null,
      booked_starts,
    },
    { status: 200, headers: { "Cache-Control": "private, no-store, no-cache, must-revalidate" } }
  );
}
