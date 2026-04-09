"use client";

import { useEffect, useState } from "react";
import {
  buildAvailableDatesFromVansunDays,
  buildHalfHourSlotsForVansunDay,
  filterSlotsByBookedStarts,
  vansunDaysHasOpenSlotsForService,
  type VansunResolvedDayRow,
} from "@/lib/booking-schedule-from-hours";
import {
  getDevMockBookingDates,
  getDevMockBookingTimeSlots,
  isBookingScheduleDevMock,
} from "@/lib/booking-schedule-dev";
import {
  fetchAvailableBookingDates,
  fetchAvailableBookingTimes,
  fetchShopBookedSlotStartsForDate,
  fetchVansunWorkingHours,
  getBookingV1Base,
} from "@/lib/booking-v1";
import type { AvailableDateRow, TimeSlotRow } from "@/lib/booking-v1";

const BOOKING_DATE_HORIZON_DAYS = 60;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

export type BookingScheduleMode =
  | "pending"
  | "mock"
  | "legacy"
  | "working-hours";

export function useBookingSchedule(
  service: "tattoo" | "piercing",
  selectedDate: string
) {
  const apiConfigured = getBookingV1Base().length > 0;
  const scheduleDevMock = isBookingScheduleDevMock();
  const scheduleUsable = apiConfigured || scheduleDevMock;

  const [scheduleMode, setScheduleMode] =
    useState<BookingScheduleMode>("pending");
  const [vansunDays, setVansunDays] = useState<VansunResolvedDayRow[] | null>(
    null
  );
  const [availableDates, setAvailableDates] = useState<AvailableDateRow[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotRow[]>(
    []
  );
  const [datesLoading, setDatesLoading] = useState(false);
  const [timesLoading, setTimesLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (scheduleDevMock) {
      setScheduleMode("mock");
      setVansunDays(null);
      setAvailableDates(getDevMockBookingDates());
      setDatesLoading(false);
      setScheduleError(null);
      return;
    }

    if (!apiConfigured) {
      setScheduleMode("legacy");
      setVansunDays(null);
      setAvailableDates([]);
      setDatesLoading(false);
      return;
    }

    let cancelled = false;
    setScheduleMode("pending");
    setDatesLoading(true);
    setScheduleError(null);

    (async () => {
      try {
        const today = new Date();
        const from = formatLocalYmd(addDays(today, 1));
        const to = formatLocalYmd(addDays(today, BOOKING_DATE_HORIZON_DAYS));
        const payload = await fetchVansunWorkingHours(from, to);
        if (cancelled) return;

        const days = payload?.days;
        if (
          days &&
          days.length > 0 &&
          vansunDaysHasOpenSlotsForService(days, service)
        ) {
          setScheduleMode("working-hours");
          setVansunDays(days);
          setAvailableDates(buildAvailableDatesFromVansunDays(days, service));
        } else {
          setScheduleMode("legacy");
          setVansunDays(null);
          const dates = await fetchAvailableBookingDates(service);
          if (!cancelled) setAvailableDates(dates);
        }
      } catch (e) {
        if (!cancelled) {
          setScheduleError(
            e instanceof Error ? e.message : "Could not load available dates."
          );
          setAvailableDates([]);
          setScheduleMode("legacy");
          setVansunDays(null);
        }
      } finally {
        if (!cancelled) setDatesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scheduleDevMock, apiConfigured, service]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      setTimesLoading(false);
      return;
    }

    if (scheduleDevMock) {
      setAvailableTimeSlots(getDevMockBookingTimeSlots());
      setTimesLoading(false);
      return;
    }

    if (!apiConfigured) {
      setAvailableTimeSlots([]);
      setTimesLoading(false);
      return;
    }

    if (scheduleMode === "pending") {
      setAvailableTimeSlots([]);
      setTimesLoading(false);
      return;
    }

    if (scheduleMode === "working-hours" && vansunDays) {
      let cancelled = false;
      setTimesLoading(true);
      setScheduleError(null);
      (async () => {
        try {
          const booked = await fetchShopBookedSlotStartsForDate(selectedDate);
          const dayRow = vansunDays.find((d) => d.date === selectedDate);
          let slots = buildHalfHourSlotsForVansunDay(dayRow, service);
          if (booked !== null && booked.length > 0) {
            slots = filterSlotsByBookedStarts(slots, booked);
          }
          if (!cancelled) setAvailableTimeSlots(slots);
        } catch (e) {
          if (!cancelled) {
            setScheduleError(
              e instanceof Error ? e.message : "Could not load time slots."
            );
            setAvailableTimeSlots([]);
          }
        } finally {
          if (!cancelled) setTimesLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    if (scheduleMode === "legacy") {
      let cancelled = false;
      setTimesLoading(true);
      setScheduleError(null);
      (async () => {
        try {
          const times = await fetchAvailableBookingTimes(service, selectedDate);
          if (!cancelled) setAvailableTimeSlots(times);
        } catch (e) {
          if (!cancelled) {
            setScheduleError(
              e instanceof Error ? e.message : "Could not load time slots."
            );
            setAvailableTimeSlots([]);
          }
        } finally {
          if (!cancelled) setTimesLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    setAvailableTimeSlots([]);
    setTimesLoading(false);
  }, [
    selectedDate,
    scheduleDevMock,
    apiConfigured,
    scheduleMode,
    vansunDays,
    service,
  ]);

  return {
    availableDates,
    availableTimeSlots,
    datesLoading,
    timesLoading,
    scheduleError,
    scheduleUsable,
    apiConfigured,
    scheduleDevMock,
    scheduleMode,
  };
}
