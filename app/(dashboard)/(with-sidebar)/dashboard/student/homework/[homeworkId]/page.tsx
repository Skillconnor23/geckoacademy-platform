import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { requireRole } from '@/lib/auth/user';
import { getStudentHomeworkDetail } from '@/lib/actions/homework';
import { HomeworkDetailClient } from './HomeworkDetailClient';

export const dynamic = 'force-dynamic';

export default async function StudentHomeworkDetailPage({
  params,
}: {
  params: Promise<{ homeworkId: string }>;
}) {
  const t = await getTranslations('homework');
  const locale = await getLocale();
  await requireRole(['student']);
  const { homeworkId } = await params;
  const data = await getStudentHomeworkDetail(homeworkId);
  if (!data) notFound();

  const { homework, className, submission } = data;
  const backHref = `/${locale}/dashboard/student/homework`;

  return (
    <section className="flex-1">
      <div className="mb-6">
        <Link
          href={backHref}
          className="text-sm text-muted-foreground hover:text-[#1f2937]"
        >
          {t('backToHomework')}
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-[#1f2937]">
          {homework.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{className}</p>
      </div>

      <HomeworkDetailClient
        homework={homework}
        submission={submission}
        className={className}
      />
    </section>
  );
}
