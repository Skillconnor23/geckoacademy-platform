export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireClassroomAccess, canPostToClassroom } from '@/lib/auth/classroom';
import { listClassroomPostsWithAuthors, listClassmatesPreview } from '@/lib/db/queries/education';
import { getClassroomSidebarData } from '@/lib/db/queries/classroom';
import { getClassMonthSummary } from '@/lib/db/queries/attendance';
import { ClassAttendanceMonthCard } from '@/components/attendance/AttendanceMonthSummaryCard';
import { ClassroomFeedClient } from './ClassroomFeedClient';
import { ClassScoreCard } from './ClassScoreCard';
import { TeacherCard } from './TeacherCard';
import { ClassmatesCard } from './ClassmatesCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, ClipboardList } from 'lucide-react';
import { AddPostMenu } from '@/components/classroom/AddPostMenu';

type Props = { params: Promise<{ classId: string }> };

export default async function ClassroomPage({ params }: Props) {
  const t = await getTranslations('classroom');
  const { classId } = await params;
  const { user, eduClass } = await requireClassroomAccess(classId);

  const [posts, canPost, sidebar, classMonthSummary, classmatesData] = await Promise.all([
    listClassroomPostsWithAuthors(classId, 50),
    canPostToClassroom(user, classId),
    getClassroomSidebarData(classId),
    getClassMonthSummary({ classId }),
    listClassmatesPreview(classId, 8),
  ]);

  return (
    <section className="flex flex-col p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {/* Header - Back link + class title + People (no sticky to avoid ghost overlay) */}
        <div className="shrink-0 border-b border-[#e5e7eb] bg-white pb-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t('backToDashboard')}
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {eduClass.name}
              </h2>
              {(eduClass.geckoLevel ?? eduClass.level) && (
                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {eduClass.geckoLevel ?? eduClass.level}
                </span>
              )}
            </div>
            {eduClass.timezone && (
              <p className="mt-1 text-sm text-muted-foreground">{eduClass.timezone}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/classroom/${classId}/people`} className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {t('people')}
              </Link>
            </Button>
            {canPost && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/classroom/${classId}/attendance`}
                  className="flex items-center gap-1.5"
                >
                  <ClipboardList className="h-4 w-4" />
                  {t('attendance')}
                </Link>
              </Button>
            )}
            {canPost && <AddPostMenu classId={classId} />}
          </div>
        </div>
        </div>

        {/* Content grid: left col + sticky right sidebar */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-8 lg:pr-2 lg:pt-6">
            <div className="shrink-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/classroom-banner.svg"
                alt=""
                className="h-auto w-full object-cover"
                aria-hidden
              />
            </div>
            <Card className="shrink-0 rounded-2xl border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle>Classroom feed</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Materials, recordings, and announcements from your teacher.
                </p>
              </CardHeader>
              <CardContent>
                <ClassroomFeedClient
                  classId={classId}
                  posts={posts}
                  canPost={canPost}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - sticky on desktop */}
          <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-0 lg:self-start">
            {canPost && (
              <ClassAttendanceMonthCard
                attendanceRate={classMonthSummary.attendanceRate}
                lateRate={classMonthSummary.lateRate}
                participationAvg={classMonthSummary.participationAvg}
                totalSessionsHeld={classMonthSummary.totalSessionsHeld}
                detailsHref={`/classroom/${classId}/attendance`}
              />
            )}
            <ClassScoreCard
              classAverage30d={sidebar.classAverage30d}
              attemptRate30d={sidebar.attemptRate30d}
              lastActivity={sidebar.lastActivity}
            />
            <ClassmatesCard
              classId={classId}
              classmates={classmatesData.classmates}
              total={classmatesData.total}
            />
            {sidebar.teacher && (
              <TeacherCard teacher={sidebar.teacher} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
