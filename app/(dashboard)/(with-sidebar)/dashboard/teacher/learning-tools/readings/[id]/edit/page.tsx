export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/user';
import { getReadingForTeacher } from '@/lib/db/queries/readings';
import { updateReadingAction } from '@/lib/actions/learning/readings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default async function EditReadingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole(['teacher', 'admin', 'school_admin']);
  const t = await getTranslations('teacher.readings');
  const { id: readingId } = await params;
  const { error } = await searchParams;

  const data = await getReadingForTeacher(readingId, user.id);
  if (!data) notFound();

  const { reading } = data;
  const vocab = (reading.vocab as string[] | null) ?? [];
  const questions = (reading.questions as string[] | null) ?? [];

  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-1 min-h-10">
          <Link
            href="/dashboard/teacher/learning-tools"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToLearningTools')}
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-medium text-[#1f2937] tracking-tight sm:text-2xl">
            {t('editTitle')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{data.className}</p>
        </div>

        {error && (
          <p className="rounded-xl border border-[#b64b29] bg-[#b64b29]/5 px-4 py-2 text-sm text-[#b64b29]">
            Please fill in required fields.
          </p>
        )}

        <Card className="rounded-2xl border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('editTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateReadingAction} className="space-y-5">
              <input type="hidden" name="readingId" value={reading.id} />

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#1f2937]">
                  {t('titleLabel')} <span className="text-[#b64b29]">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={reading.title}
                  className="mt-1 w-full min-h-10 rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-[#1f2937]">
                  {t('readingTextLabel')} <span className="text-[#b64b29]">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={10}
                  defaultValue={reading.content}
                  className="mt-1 w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="vocabulary" className="block text-sm font-medium text-[#1f2937]">
                  {t('vocabularyLabel')}
                </label>
                <textarea
                  id="vocabulary"
                  name="vocabulary"
                  rows={4}
                  defaultValue={vocab.join('\n')}
                  placeholder={t('vocabularyPlaceholder')}
                  className="mt-1 w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="questions" className="block text-sm font-medium text-[#1f2937]">
                  {t('questionsLabel')}
                </label>
                <textarea
                  id="questions"
                  name="questions"
                  rows={4}
                  defaultValue={questions.join('\n')}
                  placeholder={t('questionsPlaceholder')}
                  className="mt-1 w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" className="min-h-10 rounded-full bg-[#429ead] text-white hover:bg-[#36899a]">
                  {t('save')}
                </Button>
                <Button type="button" variant="secondary" className="min-h-10 rounded-full" asChild>
                  <Link href="/dashboard/teacher/learning-tools">{t('cancel')}</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
