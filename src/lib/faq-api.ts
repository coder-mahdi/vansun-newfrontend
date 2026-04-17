/**
 * Booking FAQs.
 *
 * - **Mock / dev:** `NEXT_PUBLIC_CONTENT_MODE` not `live` (default) uses
 *   `mockBookingFaqsPiercing` / `mockBookingFaqsTattoo` in `@/data/faqs`, no HTTP.
 * - **Live:** when `NEXT_PUBLIC_CONTENT_MODE=live` and `NEXT_PUBLIC_API_URL` is set,
 *   **GET** `/faqs?context=booking&service=piercing` (or `tattoo`). Response: JSON array
 *   or `{ faqs: [...] }` | `{ data: [...] }`. Each row: `question` | `title`,
 *   `answer` | `content` | `body`, optional `id` | `slug`.
 * - **Override:** `NEXT_PUBLIC_BOOKING_FAQ_MOCK=1` always uses the local mocks (e.g. live
 *   CMS but FAQs not updated yet).
 */
import type { FAQ } from "@/data/faqs";
import {
  mockBookingFaqsPiercing,
  mockBookingFaqsTattoo,
} from "@/data/faqs";
import { isMockContentMode } from "@/lib/content-mode";

export type BookingFaqService = "piercing" | "tattoo";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
}

function asArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.faqs)) return o.faqs;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

function slugId(question: string, index: number): string {
  const base = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || `faq-${index}`;
}

function normalizeFaqRow(row: unknown, index: number): FAQ | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const question = String(o.question ?? o.title ?? "").trim();
  const answer = String(o.answer ?? o.content ?? o.body ?? "").trim();
  if (!question || !answer) return null;
  const idRaw = String(o.id ?? o.slug ?? "").trim();
  const id = idRaw || slugId(question, index);
  return { id, question, answer };
}

function mockForService(service: BookingFaqService): FAQ[] {
  return service === "piercing"
    ? [...mockBookingFaqsPiercing]
    : [...mockBookingFaqsTattoo];
}

function bookingFaqUseLocalMocks(): boolean {
  const raw = process.env.NEXT_PUBLIC_BOOKING_FAQ_MOCK?.trim().toLowerCase();
  if (raw === "1" || raw === "true") return true;
  return isMockContentMode();
}

export async function fetchBookingFaqs(
  service: BookingFaqService
): Promise<FAQ[]> {
  if (bookingFaqUseLocalMocks()) {
    return mockForService(service);
  }

  const base = apiBase();
  if (!base) {
    return mockForService(service);
  }

  try {
    const origin = base.replace(/\/+$/, "");
    const path = `/faqs?context=booking&service=${encodeURIComponent(service)}`;
    const res = await fetch(`${origin}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`GET faqs failed: ${res.status}`);
    const payload = (await res.json()) as unknown;
    const rows = asArray(payload);
    const out = rows
      .map((row, i) => normalizeFaqRow(row, i))
      .filter(Boolean) as FAQ[];
    if (out.length > 0) return out;
  } catch {
    /* fall through to mock */
  }

  return mockForService(service);
}
