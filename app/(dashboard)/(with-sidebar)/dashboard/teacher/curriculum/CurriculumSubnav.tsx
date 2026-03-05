'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type ClassRow = { id: string; name: string };

type Props = {
  classes: ClassRow[];
};

export function CurriculumSubnav({ classes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('curriculum');

  const currentClassId = searchParams.get('classId') ?? classes[0]?.id ?? '';

  function handleClassChange(classId: string) {
    const page = pathname?.includes('/planner') ? 'planner' : 'materials';
    const url = `/${locale}/dashboard/teacher/curriculum/${page}?classId=${classId}`;
    router.push(url);
  }

  const materialsHref = currentClassId
    ? `/dashboard/teacher/curriculum/materials?classId=${currentClassId}`
    : '/dashboard/teacher/curriculum/materials';
  const plannerHref = currentClassId
    ? `/dashboard/teacher/curriculum/planner?classId=${currentClassId}`
    : '/dashboard/teacher/curriculum/planner';

  const pathWithoutLocale = pathname?.replace(new RegExp(`^/${locale}`), '') ?? '';
  const isMaterials = pathWithoutLocale.includes('/materials');
  const isPlanner = pathWithoutLocale.includes('/planner');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex gap-2" aria-label="Curriculum sections">
          <Link
            href={locale ? `/${locale}${materialsHref}` : materialsHref}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isMaterials
                ? 'bg-[#7daf41] text-white'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t('materialsTitle')}
          </Link>
          <Link
            href={locale ? `/${locale}${plannerHref}` : plannerHref}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isPlanner
                ? 'bg-[#7daf41] text-white'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t('plannerTitle')}
          </Link>
        </nav>
        {classes.length > 1 && (
          <select
            value={currentClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="h-9 rounded-full border border-input bg-background px-3 py-1 text-sm"
            aria-label={t('selectClass')}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
