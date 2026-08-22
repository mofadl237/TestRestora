export const DEFAULT_TIME_ZONE = "Africa/Cairo";

export interface IZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = formatterCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, fmt);
  }
  return fmt;
}

/** Wall-clock components of a Date expressed in a given IANA time zone. */
export function zonedParts(date: Date, timeZone: string): IZonedParts {
  const parts = partsFormatter(timeZone).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  let hour = get("hour");
  if (hour === 24) hour = 0;
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour,
    minute: get("minute"),
    second: get("second"),
  };
}

/** UTC offset in milliseconds at a given instant for a time zone. */
export function zonedOffsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - date.getTime();
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/** UTC instant of local midnight in `timeZone` for the date containing `date`. */
export function startOfDayInTz(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  const guess = new Date(Date.UTC(p.year, p.month - 1, p.day));
  return new Date(guess.getTime() - zonedOffsetMs(guess, timeZone));
}

/** UTC instant of local midnight of the first day of the month in `timeZone`. */
export function startOfMonthInTz(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  const guess = new Date(Date.UTC(p.year, p.month - 1, 1));
  return new Date(guess.getTime() - zonedOffsetMs(guess, timeZone));
}

/** UTC instant of local midnight of the first day of the previous month. */
export function prevMonthStartInTz(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  const firstOfPrev = new Date(Date.UTC(p.year, p.month - 2, 1));
  const guess = new Date(Date.UTC(firstOfPrev.getUTCFullYear(), firstOfPrev.getUTCMonth(), 1));
  return new Date(guess.getTime() - zonedOffsetMs(guess, timeZone));
}

/** Weekday in `timeZone`: 0 = Sunday … 6 = Saturday (Date#getDay convention). */
export function zonedWeekday(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
}

/** ISO weekday in `timeZone`: 0 = Monday … 6 = Sunday. */
export function isoWeekdayInTz(date: Date, timeZone: string): number {
  return (zonedWeekday(date, timeZone) + 6) % 7;
}

/** Local midnight of Monday of the current ISO week. */
export function startOfIsoWeekInTz(date: Date, timeZone: string): Date {
  return addDays(startOfDayInTz(date, timeZone), -isoWeekdayInTz(date, timeZone));
}

/** `YYYY-MM-DD` wall-clock date key in `timeZone`. */
export function dateKeyInTz(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** `MM-DD` key in `timeZone` (safe for short rolling windows). */
export function dayKeyInTz(date: Date, timeZone: string): string {
  return dateKeyInTz(date, timeZone).slice(5);
}

/** Hour (0-23) in `timeZone`. */
export function zonedHour(date: Date, timeZone: string): number {
  return zonedParts(date, timeZone).hour;
}

/**
 * Percent growth from `previous` to `current`, rounded. Returns `null` when
 * the baseline is zero/absent so callers can hide the badge instead of
 * showing a meaningless infinite percentage. Negative values stay negative.
 */
export function growthPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
