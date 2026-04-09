/** Matches `TimeSlotRow` / `AvailableDateRow` in `booking-v1` (kept local to avoid import cycles). */
export type HalfHourSlotRow = { time: string; end_time: string };
export type CalendarDateRow = { date: string; day: string };

export type DayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type NormalizedDay = {
  open: boolean;
  start?: string;
  end?: string;
};

export type NormalizedWeekly = Record<DayKey, NormalizedDay>;

const DAY_ORDER_MON_FIRST: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const JS_DAY_TO_KEY: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toHHMM(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw.trim();
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${pad2(h)}:${pad2(min)}`;
}

function pickTime(
  o: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

function normalizeKey(k: string): DayKey | null {
  const x = k.trim().toLowerCase();
  const map: Record<string, DayKey> = {
    sun: "sunday",
    sunday: "sunday",
    "0": "sunday",
    mon: "monday",
    monday: "monday",
    "1": "monday",
    tue: "tuesday",
    tues: "tuesday",
    tuesday: "tuesday",
    "2": "tuesday",
    wed: "wednesday",
    weds: "wednesday",
    wednesday: "wednesday",
    "3": "wednesday",
    thu: "thursday",
    thur: "thursday",
    thurs: "thursday",
    thursday: "thursday",
    "4": "thursday",
    fri: "friday",
    friday: "friday",
    "5": "friday",
    sat: "saturday",
    saturday: "saturday",
    "6": "saturday",
  };
  return map[x] ?? null;
}

function emptyWeek(): NormalizedWeekly {
  return {
    sunday: { open: false },
    monday: { open: false },
    tuesday: { open: false },
    wednesday: { open: false },
    thursday: { open: false },
    friday: { open: false },
    saturday: { open: false },
  };
}

function normalizeDayEntry(raw: unknown): NormalizedDay {
  if (!raw || typeof raw !== "object") return { open: false };
  const o = raw as Record<string, unknown>;
  if (
    o.closed === true ||
    o.enabled === false ||
    o.open === false ||
    o.is_open === false
  ) {
    return { open: false };
  }
  const start = pickTime(o, ["start", "open", "open_time", "from", "opens"]);
  const end = pickTime(o, ["end", "close", "close_time", "to", "closes"]);
  if (start && end) {
    return { open: true, start: toHHMM(start), end: toHHMM(end) };
  }
  return { open: false };
}

function mergeScheduleObject(
  week: NormalizedWeekly,
  obj: Record<string, unknown>
): void {
  for (const [k, v] of Object.entries(obj)) {
    const key = normalizeKey(k);
    if (!key) continue;
    week[key] = normalizeDayEntry(v);
  }
}

/**
 * Accepts common REST shapes: { working_hours: { monday: {...} } }, { schedule: [...] }, etc.
 */
export function parseWorkingHoursPayload(data: unknown): NormalizedWeekly | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const week = emptyWeek();

  const payload =
    (root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null) ??
    (root.result && typeof root.result === "object"
      ? (root.result as Record<string, unknown>)
      : null) ??
    root;

  const nested =
    (payload.working_hours as Record<string, unknown> | undefined) ??
    (payload.workingHours as Record<string, unknown> | undefined) ??
    (payload.days as Record<string, unknown> | undefined) ??
    (payload.hours as Record<string, unknown> | undefined) ??
    (payload.schedule && !Array.isArray(payload.schedule)
      ? (payload.schedule as Record<string, unknown>)
      : undefined);

  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    mergeScheduleObject(week, nested);
  }

  const arr = payload.schedule;
  if (Array.isArray(arr)) {
    for (const row of arr) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      let key: DayKey | null = null;
      if (typeof o.weekday === "string") key = normalizeKey(o.weekday);
      else if (typeof o.weekday === "number" && o.weekday >= 0 && o.weekday <= 6) {
        key = JS_DAY_TO_KEY[o.weekday];
      } else if (typeof o.day === "string") key = normalizeKey(o.day);
      if (!key) continue;
      week[key] = normalizeDayEntry(o);
    }
  }

  if (!hasAnyOpenDayInWeekly(week)) {
    const maybeRootIsDays = !nested && !Array.isArray(arr);
    if (maybeRootIsDays) {
      mergeScheduleObject(week, payload);
    }
  }

  return hasAnyOpenDayInWeekly(week) ? week : null;
}

export function hasAnyOpenDayInWeekly(week: NormalizedWeekly): boolean {
  return DAY_ORDER_MON_FIRST.some((d) => week[d].open);
}

export function dayKeyFromDate(d: Date): DayKey {
  return JS_DAY_TO_KEY[d.getDay()];
}

function parseHHMMToMinutes(s: string): number | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
}

function formatMinutesAsHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** 30-minute slots [open, close) — last slot ends at close. */
export function buildHalfHourSlots(
  openMin: number,
  closeMin: number
): HalfHourSlotRow[] {
  const slots: HalfHourSlotRow[] = [];
  for (let t = openMin; t + 30 <= closeMin; t += 30) {
    slots.push({
      time: formatMinutesAsHHMM(t),
      end_time: formatMinutesAsHHMM(t + 30),
    });
  }
  return slots;
}

export function buildHalfHourSlotsForDate(
  week: NormalizedWeekly,
  dateStr: string
): HalfHourSlotRow[] {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return [];
  const day = week[dayKeyFromDate(d)];
  if (!day.open || !day.start || !day.end) return [];
  const openM = parseHHMMToMinutes(day.start);
  const closeM = parseHHMMToMinutes(day.end);
  if (openM === null || closeM === null || closeM <= openM) return [];
  return buildHalfHourSlots(openM, closeM);
}

export function buildAvailableDatesFromWeekly(
  week: NormalizedWeekly,
  horizonDays: number,
  startFrom: Date = new Date()
): CalendarDateRow[] {
  const rows: CalendarDateRow[] = [];
  const start = new Date(startFrom);
  start.setHours(0, 0, 0, 0);
  for (let i = 1; i <= horizonDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = dayKeyFromDate(d);
    if (!week[key].open) continue;
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const date = `${y}-${m}-${day}`;
    const dayName = d.toLocaleDateString("en-CA", { weekday: "short" });
    rows.push({ date, day: dayName });
  }
  return rows;
}

export function normalizeSlotStartTime(t: string): string {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t.trim();
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return `${pad2(h)}:${pad2(min)}`;
}

export function filterSlotsByBookedStarts(
  slots: HalfHourSlotRow[],
  bookedStarts: string[]
): HalfHourSlotRow[] {
  const taken = new Set(bookedStarts.map(normalizeSlotStartTime));
  return slots.filter((s) => !taken.has(normalizeSlotStartTime(s.time)));
}

const DAY_LABEL: Record<DayKey, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export function formatWorkingHoursSummaryLines(week: NormalizedWeekly): string[] {
  const lines: string[] = [];
  for (const d of DAY_ORDER_MON_FIRST) {
    const s = week[d];
    if (!s.open || !s.start || !s.end) continue;
    lines.push(`${DAY_LABEL[d]}: ${s.start}–${s.end}`);
  }
  return lines;
}

/** vansun-core `Vansun_Working_Hours_Api` + `resolve_range` rows. */
export type VansunBookingService = "tattoo" | "piercing";

export type VansunResolvedDayRow = {
  date: string;
  weekday: string;
  tattoo: { open: string; close: string } | null;
  piercing: { open: string; close: string } | null;
};

export type VansunWorkingHoursApiResponse = {
  timezone?: string;
  weekly?: unknown;
  exceptions?: unknown;
  days?: VansunResolvedDayRow[];
};

const VANSUN_WEEKDAY_SHORT: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function shortLabelFromVansunWeekdayKey(key: string): string {
  const k = key.trim().toLowerCase().slice(0, 3);
  return VANSUN_WEEKDAY_SHORT[k] ?? key;
}

export function buildAvailableDatesFromVansunDays(
  days: VansunResolvedDayRow[],
  service: VansunBookingService
): CalendarDateRow[] {
  const rows: CalendarDateRow[] = [];
  for (const d of days) {
    const w = d[service];
    if (!w || !w.open || !w.close) continue;
    rows.push({
      date: d.date,
      day: shortLabelFromVansunWeekdayKey(d.weekday),
    });
  }
  return rows;
}

export function vansunDaysHasOpenSlotsForService(
  days: VansunResolvedDayRow[],
  service: VansunBookingService
): boolean {
  return days.some((d) => {
    const w = d[service];
    return w && w.open && w.close;
  });
}

export function buildHalfHourSlotsForVansunDay(
  day: VansunResolvedDayRow | undefined,
  service: VansunBookingService
): HalfHourSlotRow[] {
  if (!day) return [];
  const w = day[service];
  if (!w || !w.open || !w.close) return [];
  const openM = parseHHMMToMinutes(w.open);
  const closeM = parseHHMMToMinutes(w.close);
  if (openM === null || closeM === null || closeM <= openM) return [];
  return buildHalfHourSlots(openM, closeM);
}

/**
 * Booked 30-minute slot starts for a calendar day (tattoo + piercing share the same studio slots).
 * Accepts e.g. { booked_starts: ["10:00"] }, { slots: [...] }, or [{ start: "10:00" }].
 */
export function parseBookedSlotStartsPayload(data: unknown): string[] | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const arr =
    root.booked_starts ??
    root.booked_starts_30 ??
    root.slots ??
    root.booked ??
    root.times ??
    root.occupied;
  if (!Array.isArray(arr)) return null;
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item === "string") {
      out.push(item);
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const s =
        o.start ??
        o.time ??
        o.booking_time ??
        o.slot_start;
      if (typeof s === "string") out.push(s);
    }
  }
  return out;
}
