import type { ClassSchedule, DayOfWeek, Occurrence } from './types';
import { localTimeInZoneToUTC, getWeekdayInTz, getLocalDatePartsInTz } from './tz';

const DAY_NAME_TO_NUM: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function dateToUTCMidnight(d: Date): number {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x.getTime();
}

function dayNamesToNumbers(days: DayOfWeek[]): number[] {
  return days
    .map((d) => DAY_NAME_TO_NUM[d.toLowerCase().slice(0, 3)])
    .filter((n) => n !== undefined);
}

/**
 * Pure function: generate recurring occurrences from a class schedule within a range.
 * Returns Occurrence[] with startsAt/endsAt in UTC.
 */
export function generateOccurrences(
  schedule: ClassSchedule,
  rangeStart: Date,
  rangeEnd: Date
): Occurrence[] {
  const days = schedule.scheduleDays;
  const dayNumbers = dayNamesToNumbers(days);
  if (dayNumbers.length === 0) return [];

  const tz = schedule.scheduleTimezone || 'UTC';
  const [hh, mm] = (schedule.scheduleStartTime || '00:00').split(':').map(Number);
  const hour = hh ?? 0;
  const minute = mm ?? 0;
  const startDateObj = new Date(schedule.scheduleStartDate);
  const endDateObj = schedule.scheduleEndDate ? new Date(schedule.scheduleEndDate) : null;
  const startDateStr = startDateObj.toISOString().slice(0, 10);
  const endDateStr = endDateObj ? endDateObj.toISOString().slice(0, 10) : null;

  const startMs = Math.max(
    dateToUTCMidnight(startDateObj),
    dateToUTCMidnight(rangeStart)
  );
  const rangeEndMs = rangeEnd.getTime();
  const endLimit = endDateObj
    ? Math.min(dateToUTCMidnight(endDateObj) + 86400000, rangeEndMs + 86400000)
    : rangeEndMs + 86400000;

  const result: Occurrence[] = [];
  for (let utcMs = startMs; utcMs < endLimit; utcMs += 86400000) {
    const d = new Date(utcMs);
    const weekday = getWeekdayInTz(d, tz);
    if (!dayNumbers.includes(weekday)) continue;

    const parts = getLocalDatePartsInTz(d, tz);
    const localDateStr = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    if (localDateStr < startDateStr) continue;
    if (endDateStr && localDateStr > endDateStr) continue;

    const startsAt = localTimeInZoneToUTC(parts.year, parts.month, parts.day, hour, minute, tz);
    const endsAt = new Date(startsAt.getTime() + schedule.durationMinutes * 60 * 1000);

    if (startsAt.getTime() < rangeStart.getTime() || startsAt.getTime() > rangeEndMs) continue;

    result.push({
      startsAt,
      endsAt,
      classId: schedule.id,
      className: schedule.name,
      geckoLevel: schedule.geckoLevel ?? null,
      meetingUrl: schedule.defaultMeetingUrl ?? null,
      isOverride: false,
    });
  }
  return result;
}
