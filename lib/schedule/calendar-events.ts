import { getOccurrencesForUser } from './index';
import { getClassesWithScheduleForCalendar } from '@/lib/db/queries/education';

/**
 * Calendar event shape for the student schedule month view.
 * Server returns Date objects; when serialized to client they become ISO strings.
 */
export type CalendarEvent = {
  id: string;
  classId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  classTimezone: string;
  joinUrl: string | null;
  classroomUrl: string;
};

/** Client-received shape after RSC serialization (dates as ISO strings). */
export type CalendarEventClient = Omit<
  CalendarEvent,
  'startsAt' | 'endsAt'
> & { startsAt: string; endsAt: string };

/**
 * Server helper: get calendar events for a student in a date range.
 * Uses existing occurrence generation (no new DB tables).
 */
export async function getCalendarEventsForStudent(
  userId: number,
  rangeStart: Date,
  rangeEnd: Date
): Promise<CalendarEvent[]> {
  const [occurrences, classes] = await Promise.all([
    getOccurrencesForUser(userId, 'student', rangeStart, rangeEnd),
    getClassesWithScheduleForCalendar(userId, 'student'),
  ]);

  const tzByClassId = new Map<string, string>();
  for (const c of classes) {
    tzByClassId.set(c.id, c.scheduleTimezone ?? 'Asia/Ulaanbaatar');
  }

  return occurrences.map((o) => ({
    id: `${o.classId}-${o.startsAt.toISOString()}`,
    classId: o.classId,
    title: o.className,
    startsAt: o.startsAt,
    endsAt: o.endsAt,
    classTimezone: tzByClassId.get(o.classId) ?? 'Asia/Ulaanbaatar',
    joinUrl: o.meetingUrl,
    classroomUrl: `/classroom/${o.classId}`,
  }));
}
