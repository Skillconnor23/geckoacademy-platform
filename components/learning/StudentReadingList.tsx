import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listReadingsForStudent, isReadingThisWeek } from '@/lib/db/queries/readings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText, CheckCircle2 } from 'lucide-react';

export async function StudentReadingList({
  studentUserId,
}: {
  studentUserId: number;
}) {
  const t = await getTranslations('learning');
  const tQuizzes = await getTranslations('quizzes');
  const list = await listReadingsForStudent(studentUserId);

  const thisWeekReadings = list.filter((item) =>
    isReadingThisWeek(item.reading.weekOf)
  );
  const thisWeek = thisWeekReadings[0] ?? null;

  return (
    <div className="space-y-5">
      {thisWeek && (
        <>
          <Card
            className={`rounded-2xl border-2 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
              !thisWeek.completedAt ? 'border-[#7daf41]/50' : 'border-[#e5e7eb]'
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {tQuizzes('thisWeek')}
                <span className="inline-flex rounded-full bg-[#e5e7eb]/80 px-2.5 py-0.5 text-xs font-medium text-[#6b7280]">
                  {tQuizzes('thisWeek')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <p className="font-medium text-[#1f2937]">{thisWeek.reading.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {thisWeek.className}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {thisWeek.completedAt ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7daf41]/10 px-3 py-1 text-sm font-medium text-[#7daf41]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t('completed')}
                  </span>
                ) : null}
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-10 rounded-full bg-[#429ead] px-4 text-sm text-white hover:bg-[#36899a]"
                  asChild
                >
                  <Link href={`/dashboard/student/learning/reading/${thisWeek.reading.id}`}>
                    {t('read')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="rounded-2xl border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('allReadings')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-5">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookText className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden />
              <p className="font-medium text-[#1f2937]">{t('noReadingsYet')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map(({ reading, className, completedAt }) => (
                <li
                  key={reading.id}
                  className="flex flex-col gap-3 rounded-xl border border-[#e5e7eb]/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1f2937] text-sm sm:text-base">
                      {reading.title}
                    </p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{className}</p>
                    {completedAt && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#7daf41]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('completed')}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="min-h-10 shrink-0 rounded-full bg-[#429ead] px-4 text-sm text-white hover:bg-[#36899a]"
                    asChild
                  >
                    <Link href={`/dashboard/student/learning/reading/${reading.id}`}>
                      {t('read')}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
