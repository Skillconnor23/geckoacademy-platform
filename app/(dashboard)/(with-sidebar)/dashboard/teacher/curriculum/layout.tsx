export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth/user';
import { listClassesForTeacher } from '@/lib/db/queries/education';
import { getTranslations } from 'next-intl/server';
import { CurriculumSubnav } from './CurriculumSubnav';

export default async function CurriculumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(['teacher']);
  const classes = await listClassesForTeacher(user.id);

  if (classes.length === 0) {
    const t = await getTranslations('curriculum');
    return (
      <section className="flex-1">
        <div className="mx-auto max-w-2xl py-12 text-center">
          <p className="text-muted-foreground">{t('noClassesYet')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 space-y-6">
      <CurriculumSubnav classes={classes} />
      {children}
    </section>
  );
}
