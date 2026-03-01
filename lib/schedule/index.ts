import type { PlatformRole } from '@/lib/db/schema';
import {
  getClassesWithScheduleForCalendar,
  getSessionsInRange,
} from '@/lib/db/queries/education';
import type { ClassSchedule, DayOfWeek, Occurrence } from './types';
import { generateOccurrences } from './generate';
import { applyExceptions } from './occurrences';

export type { DayOfWeek, GeckoLevel, ClassSchedule, Occurrence, SessionRow } from './types';
export { generateOccurrences } from './generate';
export { applyExceptions } from './occurrences';

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** Normalize schedule days: string[] ["sat","sun"] or legacy number[] [0,6] -> DayOfWeek[]. */
function normalizeScheduleDays(days: unknown): DayOfWeek[] {
  if (!Array.isArray(days) || days.length === 0) return [];
  const first = days[0];
  if (typeof first === 'string') return days as DayOfWeek[];
  return (days as number[])
    .map((n) => DAY_NAMES[n] ?? 'sun')
    .filter((d): d is DayOfWeek => !!d);
}

/** Convert DB class row to ClassSchedule. */
function toClassSchedule(row: Awaited<ReturnType<typeof getClassesWithScheduleForCalendar>>[number]): ClassSchedule | null {
  const days = normalizeScheduleDays(row.scheduleDays);
  if (days.length === 0 || !row.scheduleStartDate) return null;

  return {
    id: row.id,
    name: row.name,
    geckoLevel: row.geckoLevel ?? null,
    scheduleDays: days,
    scheduleStartTime: row.scheduleStartTime ?? '00:00',
    scheduleTimezone: row.scheduleTimezone ?? 'Asia/Ulaanbaatar',
    scheduleStartDate: row.scheduleStartDate,
    scheduleEndDate: row.scheduleEndDate ?? null,
    durationMinutes: row.durationMinutes ?? 50,
    defaultMeetingUrl: row.defaultMeetingUrl ?? null,
  };
}

/**
 * Orchestrator: fetch DB data, generate occurrences, apply exceptions.
 * Single entry point for pages.
 */
export async function getOccurrencesForUser(
  userId: number,
  role: PlatformRole,
  rangeStart: Date,
  rangeEnd: Date,
  classIdFilter?: string | null
): Promise<Occurrence[]> {
  const classes = await getClassesWithScheduleForCalendar(userId, role);
  const filtered =
    classIdFilter && classIdFilter !== 'all'
      ? classes.filter((c) => c.id === classIdFilter)
      : classes;

  const classIds = filtered.map((c) => c.id);
  const sessions = await getSessionsInRange(classIds, rangeStart, rangeEnd);

  const tzByClass = new Map<string, string>();
  const classById = new Map<string, { name: string; geckoLevel: string | null; defaultMeetingUrl: string | null }>();
  for (const c of filtered) {
    tzByClass.set(c.id, c.scheduleTimezone ?? 'Asia/Ulaanbaatar');
    classById.set(c.id, {
      name: c.name,
      geckoLevel: c.geckoLevel ?? null,
      defaultMeetingUrl: c.defaultMeetingUrl ?? null,
    });
  }

  const rangeStartMs = rangeStart.getTime();
  const rangeEndMs = rangeEnd.getTime();
  const allOccurrences: Occurrence[] = [];

  for (const row of filtered) {
    const schedule = toClassSchedule(row);
    if (!schedule) continue;

    const generated = generateOccurrences(schedule, rangeStart, rangeEnd);
    for (const o of generated) {
      if (o.startsAt.getTime() >= rangeStartMs && o.startsAt.getTime() <= rangeEndMs) {
        allOccurrences.push(o);
      }
    }
  }

  const sessionsTyped = sessions.map((s) => ({
    classId: s.classId,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    meetingUrl: s.meetingUrl,
    kind: s.kind,
    originalStartsAt: s.originalStartsAt,
  }));

  return applyExceptions(allOccurrences, sessionsTyped, tzByClass, classById);
}

/** Next N occurrences for user within 30 days. */
export async function getNextOccurrencesForUser(
  userId: number,
  role: PlatformRole,
  count = 2
): Promise<Occurrence[]> {
  const now = new Date();
  const rangeEnd = new Date(now.getTime() + 30 * 86400000);
  const all = await getOccurrencesForUser(userId, role, now, rangeEnd);
  return all.slice(0, count);
}
