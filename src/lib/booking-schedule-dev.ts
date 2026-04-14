import type { AvailableDateRow, TimeSlotRow } from "@/lib/booking-v1";
import { getBookingV1Base } from "@/lib/booking-v1";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Use fake dates/times so the piercing wizard can be tested without CMS.
 *
 * - If `getBookingV1Base()` is set (real vansun v1 URL), mock is **never** used — otherwise
 *   `NEXT_PUBLIC_BOOKING_DEV_MOCK_SCHEDULE=1` would show sample 10:00–17:00 and skip occupancy.
 * - `NEXT_PUBLIC_BOOKING_DEV_MOCK_SCHEDULE=1` (or `true`): mock when there is no booking base.
 * - Otherwise: only in development when `getBookingV1Base()` is empty (no CMS URL / booking URL).
 */
export function isBookingScheduleDevMock(): boolean {
  if (getBookingV1Base().length > 0) return false;
  const force =
    process.env.NEXT_PUBLIC_BOOKING_DEV_MOCK_SCHEDULE === "1" ||
    process.env.NEXT_PUBLIC_BOOKING_DEV_MOCK_SCHEDULE === "true";
  if (force) return true;
  if (process.env.NODE_ENV !== "development") return false;
  return true;
}

/** Next N calendar days as YYYY-MM-DD + short weekday */
export function getDevMockBookingDates(count = 12): AvailableDateRow[] {
  const rows: AvailableDateRow[] = [];
  const start = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const date = `${y}-${m}-${day}`;
    const dayName = d.toLocaleDateString("en-CA", { weekday: "short" });
    rows.push({ date, day: dayName });
  }
  return rows;
}

/** 30-minute slots 10:00–17:00 (studio-style dev sample) */
export function getDevMockBookingTimeSlots(): TimeSlotRow[] {
  const slots: TimeSlotRow[] = [];
  for (let h = 10; h < 17; h++) {
    for (const minute of [0, 30] as const) {
      const startH = h;
      const startM = minute;
      let endH = h;
      let endM = minute + 30;
      if (endM >= 60) {
        endM = 0;
        endH = h + 1;
      }
      slots.push({
        time: `${pad2(startH)}:${pad2(startM)}`,
        end_time: `${pad2(endH)}:${pad2(endM)}`,
      });
    }
  }
  return slots;
}
