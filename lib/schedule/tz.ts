/**
 * Timezone utilities for schedule generation.
 * Uses Intl to avoid external date libs.
 */

/** Given local date/time in IANA timezone, return the UTC Date. */
export function localTimeInZoneToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  tz: string
): Date {
  const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const targetTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const utcStart = Date.UTC(year, month - 1, day - 1, 0, 0, 0);
  const stepMs = 15 * 60 * 1000;
  for (let t = utcStart; t < utcStart + 48 * 60 * 60 * 1000; t += stepMs) {
    const d = new Date(t);
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const get = (p: string) => parts.find((x) => x.type === p)?.value ?? '';
    const localDate = `${get('year')}-${get('month')}-${get('day')}`;
    const localTime = `${get('hour')}:${get('minute')}`;
    if (localDate === targetDate && localTime === targetTime) return d;
  }
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
}

/** Weekday (0=Sun .. 6=Sat) in tz at UTC timestamp. */
export function getWeekdayInTz(utcDate: Date, tz: string): number {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' });
  const day = fmt.format(utcDate);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[day] ?? 0;
}

/** Local date parts in tz at UTC timestamp. */
export function getLocalDatePartsInTz(
  utcDate: Date,
  tz: string
): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(utcDate);
  const get = (p: string) => parseInt(parts.find((x) => x.type === p)?.value ?? '0', 10);
  return { year: get('year'), month: get('month'), day: get('day') };
}
