'use server';

import { getCalendarEventsForStudent } from '@/lib/schedule/calendar-events';
import { requireRole } from '@/lib/auth/user';

/**
 * Fetch calendar events for the current student in a date range.
 * Used by the client when switching months.
 */
export async function getCalendarEventsForMonth(monthStart: string, monthEnd: string) {
  const user = await requireRole(['student']);
  const start = new Date(monthStart);
  const end = new Date(monthEnd);
  const events = await getCalendarEventsForStudent(user.id, start, end);
  return events.map((e) => ({
    ...e,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt.toISOString(),
  }));
}
