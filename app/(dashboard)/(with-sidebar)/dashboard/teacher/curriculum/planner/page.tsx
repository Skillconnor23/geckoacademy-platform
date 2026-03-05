export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth/user';
import { listClassesForTeacher } from '@/lib/db/queries/education';
import { getCurriculumWeeksWithAttachments } from '@/lib/db/queries/curriculum';
import { redirect } from 'next/navigation';
import { PlannerContent } from './PlannerContent';

type Props = {
  searchParams: Promise<{ classId?: string }>;
};

export default async function PlannerPage({ searchParams }: Props) {
  const user = await requireRole(['teacher']);
  const classes = await listClassesForTeacher(user.id);
  const params = await searchParams;
  const classId = params.classId ?? classes[0]?.id;

  if (classes.length === 0) return null;

  if (!classId || !classes.some((c) => c.id === classId)) {
    redirect(`/dashboard/teacher/curriculum/planner?classId=${classes[0]!.id}`);
  }

  const weeks = await getCurriculumWeeksWithAttachments(user.id, classId);
  const className = classes.find((c) => c.id === classId)?.name ?? '';

  return (
    <PlannerContent classId={classId} weeks={weeks} className={className} />
  );
}
