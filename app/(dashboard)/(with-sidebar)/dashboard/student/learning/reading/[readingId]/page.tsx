export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/user';
import { getReadingDetail } from '@/lib/db/queries/readings';
import { markReadingCompleteAction } from '@/lib/actions/learning/readings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import { VocabularyCard } from './VocabularyCard';
import { AudioPlayButton } from '@/components/learning/AudioPlayButton';

type Props = {
  params: Promise<{ readingId: string }>;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getHighlightedSegments(
  content: string,
  vocab: string[]
): { type: 'text' | 'vocab'; value: string }[] {
  if (vocab.length === 0) return [{ type: 'text', value: content }];
  const sorted = [...vocab].filter(Boolean).sort((a, b) => b.length - a.length);
  const pattern = sorted.map((w) => `(${escapeRegex(w)})`).join('|');
  const re = new RegExp(pattern, 'gi');
  const parts = content.split(re);
  const segments: { type: 'text' | 'vocab'; value: string }[] = [];
  const lowerVocab = new Set(sorted.map((w) => w.toLowerCase()));
  for (const part of parts) {
    const value = typeof part === 'string' ? part : '';
    if (value.length === 0) continue;
    const isVocab = lowerVocab.has(value.toLowerCase());
    segments.push({ type: isVocab ? 'vocab' : 'text', value });
  }
  return segments;
}

export default async function ReadingDetailPage({ params }: Props) {
  const t = await getTranslations('learning');
  const user = await requireRole(['student']);
  const { readingId } = await params;

  const data = await getReadingDetail(readingId, user.id);
  if (!data) notFound();

  const { reading, className, completedAt } = data;
  const vocab = (reading.vocab as string[] | null) ?? [];
  const questions = (reading.questions as string[] | null) ?? [];
  const highlightedSegments = getHighlightedSegments(reading.content, vocab);

  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-1 min-h-10">
          <Link
            href="/dashboard/student/learning?tab=reading"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToReading')}
          </Link>
        </Button>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-medium text-[#1f2937] tracking-tight sm:text-2xl">
              {reading.title}
            </h1>
            {reading.audioUrl ? (
              <AudioPlayButton url={reading.audioUrl} ariaLabel="Play reading audio" />
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{className}</p>
        </div>

        {reading.description ? (
          <p className="text-sm text-muted-foreground">{reading.description}</p>
        ) : null}

        {vocab.length > 0 ? (
          <VocabularyCard words={vocab} title={t('vocabulary')} />
        ) : null}

        <Card className="rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardContent className="px-5 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-prose">
              <div className="whitespace-pre-wrap text-[#1f2937] leading-relaxed [line-height:1.75]">
                {highlightedSegments.map((seg, i) =>
                  seg.type === 'vocab' ? (
                    <span
                      key={i}
                      className="rounded bg-[#7daf41]/15 px-0.5 font-medium text-[#5a8a2e]"
                    >
                      {seg.value}
                    </span>
                  ) : (
                    <span key={i}>{seg.value}</span>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {questions.length > 0 ? (
          <Card className="rounded-2xl border border-[#e5e7eb] bg-white">
            <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
              <h2 className="text-base font-semibold text-[#1f2937] mb-3">{t('questions')}</h2>
              <ul className="list-inside list-disc space-y-2 text-sm text-[#1f2937] leading-relaxed">
                {questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <div className="rounded-2xl border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-6 sm:py-6">
          {completedAt ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7daf41]/15 text-[#5a8a2e]">
                <Star className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-[#1f2937]">{t('completed')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You finished this reading. Great work!
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#7daf41]/10 px-3 py-1.5 text-sm font-medium text-[#7daf41] ml-auto">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {t('completed')}
              </span>
            </div>
          ) : (
            <form action={markReadingCompleteAction} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="readingId" value={reading.id} />
              <Button
                type="submit"
                size="sm"
                className="min-h-10 rounded-full bg-[#7daf41] px-5 text-sm font-medium text-white hover:bg-[#6b9a39]"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t('markComplete')}
              </Button>
              <p className="text-sm text-muted-foreground">
                Mark as complete when you&apos;ve finished reading.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
