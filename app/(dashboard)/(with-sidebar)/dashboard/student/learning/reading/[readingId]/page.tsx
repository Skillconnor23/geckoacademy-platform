export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/user';
import { getReadingDetail } from '@/lib/db/queries/readings';
import { markReadingCompleteAction } from '@/lib/actions/learning/readings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

type Props = {
  params: Promise<{ readingId: string }>;
};

export default async function ReadingDetailPage({ params }: Props) {
  const t = await getTranslations('learning');
  const user = await requireRole(['student']);
  const { readingId } = await params;

  const data = await getReadingDetail(readingId, user.id);
  if (!data) notFound();

  const { reading, className, completedAt } = data;
  const vocab = (reading.vocab as string[] | null) ?? [];
  const questions = (reading.questions as string[] | null) ?? [];

  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <Button variant="ghost" size="sm" asChild className="-ml-1 min-h-10">
          <Link
            href="/dashboard/student/learning?tab=reading"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToReading')}
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-medium text-[#1f2937] tracking-tight sm:text-2xl">
            {reading.title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{className}</p>
        </div>

        {reading.description ? (
          <p className="text-sm text-muted-foreground">{reading.description}</p>
        ) : null}

        <Card className="rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardContent className="whitespace-pre-wrap pt-5 text-[#1f2937]">
            {reading.content}
          </CardContent>
        </Card>

        {vocab.length > 0 ? (
          <Card className="rounded-2xl border border-[#e5e7eb] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('vocabulary')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="list-inside list-disc space-y-1 text-sm text-[#1f2937]">
                {vocab.map((word, i) => (
                  <li key={i}>{word}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {questions.length > 0 ? (
          <Card className="rounded-2xl border border-[#e5e7eb] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('questions')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="list-inside list-disc space-y-1 text-sm text-[#1f2937]">
                {questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {completedAt ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#7daf41]/10 px-4 py-2 text-sm font-medium text-[#7daf41]">
              <CheckCircle2 className="h-4 w-4" />
              {t('completed')}
            </span>
          ) : (
            <form action={markReadingCompleteAction}>
              <input type="hidden" name="readingId" value={reading.id} />
              <Button
                type="submit"
                size="sm"
                className="min-h-10 rounded-full bg-[#7daf41] px-4 text-sm text-white hover:bg-[#6b9a39]"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t('markComplete')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
