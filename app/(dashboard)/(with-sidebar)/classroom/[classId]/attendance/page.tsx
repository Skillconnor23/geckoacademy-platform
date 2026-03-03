export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireClassroomAccess, canPostToClassroom } from '@/lib/auth/classroom';
import {
  getClassSessions,
  getOrCreateTodaySession,
  getSessionAttendance,
} from '@/lib/db/queries/attendance';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { AttendanceForm } from './AttendanceForm';

type Props = {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ session?: string }>;
};

function formatSessionDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function AttendancePage({ params, searchParams }: Props) {
  const { classId } = await params;
  const { session: sessionIdParam } = await searchParams;
  const { user, eduClass } = await requireClassroomAccess(classId);

  const canPost = await canPostToClassroom(user, classId);
  if (!canPost) {
    redirect(`/classroom/${classId}`);
  }

  const [sessions, todayResult] = await Promise.all([
    getClassSessions(classId),
    getOrCreateTodaySession(classId),
  ]);

  const sessionId =
    sessionIdParam && sessions.some((s) => s.id === sessionIdParam)
      ? sessionIdParam
      : todayResult.session.id;

  const attendanceData = await getSessionAttendance(sessionId);
  if (!attendanceData) {
    redirect(`/classroom/${classId}`);
  }

  const currentSession = attendanceData.session;

  return (
    <section className="flex flex-col p-6 lg:p-10 min-h-0 flex-1">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/classroom/${classId}`}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to classroom
            </Link>
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Attendance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {eduClass.name} · {formatSessionDate(currentSession.startsAt)}
            </p>
          </div>
        </div>

        <AttendanceForm
          key={sessionId}
          classId={classId}
          sessionId={sessionId}
          roster={attendanceData.roster}
          records={attendanceData.records}
          sessions={sessions.map((s) => ({ id: s.id, startsAt: s.startsAt }))}
        />
      </div>
    </section>
  );
}
