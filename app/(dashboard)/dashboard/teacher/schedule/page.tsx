export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth/user';
import { getScheduleSummaryForUser } from '@/lib/db/queries/education';
import { getNextOccurrencesForUser } from '@/lib/schedule';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { SetTimezoneOnMount } from '@/components/calendar/SetTimezoneOnMount';
import { CalendarDays } from 'lucide-react';

export default async function TeacherSchedulePage() {
  const user = await requireRole(['teacher']);
  const [classes, nextOccurrences] = await Promise.all([
    getScheduleSummaryForUser(user.id, 'teacher'),
    getNextOccurrencesForUser(user.id, 'teacher', 2),
  ]);
  const viewerTimezone = user.timezone ?? 'UTC';

  return (
    <section className="flex-1 p-4 lg:p-8">
      {user.timezone === null && <SetTimezoneOnMount />}
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-lg lg:text-2xl font-medium mb-6 flex items-center gap-2">
          <CalendarDays className="h-6 w-6" />
          Schedule
        </h1>
        <ScheduleView
          classes={classes}
          nextOccurrences={nextOccurrences}
          viewerTimezone={viewerTimezone}
        />
      </div>
    </section>
  );
}
