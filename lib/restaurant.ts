import {
  addDays,
  dateKeyInTz,
  isoWeekdayInTz,
  startOfDayInTz,
  zonedParts,
} from "./time";

// ═══════════════════════════════════════════════════════════════════════
// Restaurant domain types + pure availability logic.
//
// No database access lives here — the logic is fully deterministic so it can
// be shared by server actions, the public website and (future) services.
// ═══════════════════════════════════════════════════════════════════════

export interface IDayShift {
  open: string; // "HH:MM" (24h)
  close: string; // "HH:MM" (24h), exclusive
}

/** `day` follows ISO order: 0 = Monday … 6 = Sunday. */
export interface IBusinessDay {
  day: number;
  status: "open" | "closed" | "24";
  shifts: IDayShift[];
}

export interface ITemporaryClosure {
  status: "open" | "closed";
  closedUntil: string | null; // "YYYY-MM-DD" — exclusive (reopens on that date)
  reason: string; // "maintenance" | "vacation" | "emergency" | "prayer" | "other" | ""
  message: Record<string, string>;
}

export interface IHoliday {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason: Record<string, string>;
  closedAllDay: boolean;
  shifts: IDayShift[];
}

export interface IReservationSettings {
  enabled: boolean;
  capacity: number;
  maxGuests: number;
  intervalMinutes: number;
  windowDays: number;
}

export interface IBrandingSettings {
  primaryColor: string;
  logo: string;
  coverImage: string;
}

export interface IContactSettings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMaps: string;
}

export interface ISocialSettings {
  facebook: string;
  instagram: string;
  tiktok: string;
  snapchat: string;
  website: string;
}

export interface ILocalizationSettings {
  defaultLanguage: string;
  supportedLanguages: string[];
}

export type RestaurantStatus =
  | "open"
  | "closed_hours"
  | "closed_holiday"
  | "closed_temporary";

export const DAY_LABEL_ORDER: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

/** Default schedule: open every day 09:00 → 23:00. */
export const DEFAULT_BUSINESS_HOURS: IBusinessDay[] = DAY_LABEL_ORDER.map((day) => ({
  day,
  status: "open",
  shifts: [{ open: "09:00", close: "23:00" }],
}));

export const DEFAULT_TEMPORARY_CLOSURE: ITemporaryClosure = {
  status: "open",
  closedUntil: null,
  reason: "",
  message: { en: "", ar: "" },
};

export const DEFAULT_RESERVATIONS: IReservationSettings = {
  enabled: true,
  capacity: 50,
  maxGuests: 8,
  intervalMinutes: 30,
  windowDays: 14,
};

export const DEFAULT_BRANDING: IBrandingSettings = {
  primaryColor: "#ef6006",
  logo: "",
  coverImage: "",
};

export const DEFAULT_CONTACT: IContactSettings = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  googleMaps: "",
};

export const DEFAULT_SOCIAL: ISocialSettings = {
  facebook: "",
  instagram: "",
  tiktok: "",
  snapchat: "",
  website: "",
};

export const DEFAULT_LOCALIZATION: ILocalizationSettings = {
  defaultLanguage: "en",
  supportedLanguages: ["en", "ar"],
};

// ─── Time helpers ──────────────────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h = "0", m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m || "0");
}

export function minutesToTime(minutes: number): string {
  const m = Math.max(0, Math.min(23 * 60 + 59, Math.round(minutes)));
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function isValidTime(time: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [h, m] = time.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Effective shifts for a business day, honouring the status flag. */
export function effectiveShifts(day: IBusinessDay | undefined): IDayShift[] {
  if (!day || day.status === "closed") return [];
  if (day.status === "24") return [{ open: "00:00", close: "23:59" }];
  return day.shifts ?? [];
}

/** Whether a given wall-clock time falls inside any of the shifts. */
export function isTimeInShifts(hour: number, minute: number, shifts: IDayShift[]): boolean {
  const t = hour * 60 + minute;
  return shifts.some((s) => {
    const open = timeToMinutes(s.open);
    const close = timeToMinutes(s.close);
    return close > open ? t >= open && t < close : t >= open; // overnight guard
  });
}

export interface IAvailabilityInput {
  businessHours: IBusinessDay[];
  holidays: IHoliday[];
  closure: ITemporaryClosure;
  timeZone: string;
  now?: Date;
}

export interface IAvailabilityResult {
  isOpenNow: boolean;
  status: RestaurantStatus;
  reason: string | null;
  closedUntil: string | null;
  message: Record<string, string>;
  nextOpeningAt: Date | null;
}

/** Is the restaurant accepting orders right now, in the restaurant time zone? */
export function isRestaurantOpenNow(input: IAvailabilityInput): {
  open: boolean;
  status: RestaurantStatus;
  reason: string | null;
} {
  const now = input.now ?? new Date();
  const { closure, timeZone } = input;

  if (closure.status === "closed") {
    if (closure.closedUntil && dateKeyInTz(now, timeZone) < closure.closedUntil) {
      return { open: false, status: "closed_temporary", reason: closure.reason || null };
    }
    if (!closure.closedUntil) {
      return { open: false, status: "closed_temporary", reason: closure.reason || null };
    }
  }

  const todayKey = dateKeyInTz(now, timeZone);
  const holiday = input.holidays.find((h) => h.date === todayKey);
  if (holiday) {
    if (holiday.closedAllDay) return { open: false, status: "closed_holiday", reason: null };
    const p = zonedParts(now, timeZone);
    if (!isTimeInShifts(p.hour, p.minute, holiday.shifts)) {
      return { open: false, status: "closed_holiday", reason: null };
    }
    return { open: true, status: "open", reason: null };
  }

  const day = input.businessHours.find((d) => d.day === isoWeekdayInTz(now, timeZone));
  const shifts = effectiveShifts(day);
  if (!shifts.length) return { open: false, status: "closed_hours", reason: null };

  const p = zonedParts(now, timeZone);
  if (!isTimeInShifts(p.hour, p.minute, shifts)) {
    return { open: false, status: "closed_hours", reason: null };
  }
  return { open: true, status: "open", reason: null };
}

/**
 * Next instant the restaurant opens, scanning up to 7 days ahead in the
 * restaurant time zone. Returns `null` for indefinite closures.
 */
export function nextOpeningAt(input: IAvailabilityInput): Date | null {
  const now = input.now ?? new Date();
  const { closure, timeZone } = input;

  if (closure.status === "closed" && !closure.closedUntil) return null;

  let cursor = startOfDayInTz(now, timeZone);
  const p = zonedParts(now, timeZone);
  const nowMinutes = p.hour * 60 + p.minute;

  for (let i = 0; i < 8; i++) {
    const dayKey = dateKeyInTz(cursor, timeZone);

    if (closure.status === "closed" && dayKey < (closure.closedUntil ?? dayKey)) {
      cursor = addDays(cursor, 1);
      continue;
    }

    const holiday = input.holidays.find((h) => h.date === dayKey);
    let shifts: IDayShift[];
    if (holiday) {
      if (holiday.closedAllDay) {
        cursor = addDays(cursor, 1);
        continue;
      }
      shifts = holiday.shifts;
    } else {
      const day = input.businessHours.find((d) => d.day === isoWeekdayInTz(cursor, timeZone));
      shifts = effectiveShifts(day);
    }

    if (!shifts.length) {
      cursor = addDays(cursor, 1);
      continue;
    }

    const base = cursor.getTime();

    // Same day: find the next shift start still ahead of now (handles split
    // shifts like lunch break closures).
    if (i === 0) {
      const upcoming = shifts
        .map((s) => timeToMinutes(s.open))
        .filter((open) => open > nowMinutes)
        .map((open) => new Date(base + open * 60_000))
        .sort((a, b) => a.getTime() - b.getTime());
      if (upcoming.length) return upcoming[0];
    } else {
      const firstOpen = Math.min(...shifts.map((s) => timeToMinutes(s.open)));
      return new Date(base + firstOpen * 60_000);
    }

    cursor = addDays(cursor, 1);
  }

  return null;
}

/** Convenience wrapper: full availability snapshot. */
export function getAvailability(input: IAvailabilityInput): IAvailabilityResult {
  const state = isRestaurantOpenNow(input);
  return {
    isOpenNow: state.open,
    status: state.status,
    reason: state.reason,
    closedUntil: input.closure.closedUntil,
    message: input.closure.message,
    nextOpeningAt: nextOpeningAt(input),
  };
}
