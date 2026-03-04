export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/user';
import { listTeacherQuizzesForUser } from '@/lib/db/queries/quizzes';
import { listFlashcardDecksForManager } from '@/lib/db/queries/flashcards';
import { listReadingsForTeacher } from '@/lib/db/queries/readings';
import {
  deleteQuizAction,
  deleteFlashcardDeckAction,
  deleteReadingAction,
} from '@/lib/actions/learning/learning-tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import { LearningToolsCreateDropdown } from './LearningToolsCreateDropdown';

type Row = {
  kind: 'quiz' | 'flashcards' | 'reading';
  id: string;
  title: string;
  class: string;
  updated: Date;
};

export default async function LearningToolsPage() {
  const user = await requireRole(['teacher', 'admin', 'school_admin']);
  const t = await getTranslations('learningTools');

  const [quizRows, deckRows, readingRows] = await Promise.all([
    listTeacherQuizzesForUser(user.id),
    listFlashcardDecksForManager(user.id, user.platformRole ?? 'teacher'),
    listReadingsForTeacher(user.id),
  ]);

  const rows: Row[] = [
    ...quizRows.map((r) => ({
      kind: 'quiz' as const,
      id: r.quiz.id,
      title: r.quiz.title,
      class: r.className,
      updated: r.quiz.updatedAt,
    })),
    ...deckRows.map((d) => ({
      kind: 'flashcards' as const,
      id: d.id,
      title: d.title,
      class: d.className ?? '—',
      updated: d.updatedAt,
    })),
    ...readingRows.map((r) => ({
      kind: 'reading' as const,
      id: r.reading.id,
      title: r.reading.title,
      class: r.className,
      updated: r.reading.updatedAt,
    })),
  ].sort((a, b) => b.updated.getTime() - a.updated.getTime());

  const typeLabel = (kind: Row['kind']) => {
    switch (kind) {
      case 'quiz':
        return t('quiz');
      case 'flashcards':
        return t('flashcards');
      case 'reading':
        return t('reading');
    }
  };

  const editHref = (row: Row) => {
    switch (row.kind) {
      case 'quiz':
        return `/teacher/quizzes/${row.id}/edit`;
      case 'flashcards':
        return `/dashboard/teacher/learning/flashcards/${row.id}`;
      case 'reading':
        return `/dashboard/teacher/learning-tools/readings/${row.id}/edit`;
    }
  };

  const previewHref = (row: Row) => {
    switch (row.kind) {
      case 'quiz':
        return `/teacher/quizzes/${row.id}/results`;
      case 'flashcards':
        return `/dashboard/teacher/learning/flashcards/${row.id}`;
      case 'reading':
        return `/dashboard/student/learning/reading/${row.id}`;
    }
  };

  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-medium text-[#1f2937] tracking-tight sm:text-2xl">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <LearningToolsCreateDropdown />
        </div>

        <Card className="rounded-2xl border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sr-only">{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
                {t('noItems')}
              </div>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e5e7eb] bg-muted/30">
                        <th className="px-4 py-3 font-medium text-[#1f2937]">{t('type')}</th>
                        <th className="px-4 py-3 font-medium text-[#1f2937]">{t('titleCol')}</th>
                        <th className="px-4 py-3 font-medium text-[#1f2937]">{t('class')}</th>
                        <th className="px-4 py-3 font-medium text-[#1f2937]">{t('updated')}</th>
                        <th className="px-4 py-3 font-medium text-[#1f2937]">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={`${row.kind}-${row.id}`}
                          className="border-b border-[#e5e7eb]/60 last:border-0"
                        >
                          <td className="px-4 py-3 text-muted-foreground">
                            {typeLabel(row.kind)}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#1f2937]">{row.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.class}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {row.updated.toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8" asChild>
                                <Link href={editHref(row)}>
                                  <Pencil className="mr-1 h-3.5 w-3.5" />
                                  {t('edit')}
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8" asChild>
                                <Link href={previewHref(row)} target="_blank" rel="noopener noreferrer">
                                  <Eye className="mr-1 h-3.5 w-3.5" />
                                  {t('preview')}
                                </Link>
                              </Button>
                              {row.kind === 'quiz' && (
                                <form action={deleteQuizAction} className="inline">
                                  <input type="hidden" name="quizId" value={row.id} />
                                  <Button type="submit" variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700">
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    {t('delete')}
                                  </Button>
                                </form>
                              )}
                              {row.kind === 'flashcards' && (
                                <form action={deleteFlashcardDeckAction} className="inline">
                                  <input type="hidden" name="deckId" value={row.id} />
                                  <Button type="submit" variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700">
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    {t('delete')}
                                  </Button>
                                </form>
                              )}
                              {row.kind === 'reading' && (
                                <form action={deleteReadingAction} className="inline">
                                  <input type="hidden" name="readingId" value={row.id} />
                                  <Button type="submit" variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700">
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    {t('delete')}
                                  </Button>
                                </form>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <div className="space-y-3 p-4 md:hidden sm:p-6">
                  {rows.map((row) => (
                    <div
                      key={`${row.kind}-${row.id}`}
                      className="rounded-xl border border-[#e5e7eb] bg-white p-4"
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {typeLabel(row.kind)}
                      </p>
                      <p className="mt-1 font-medium text-[#1f2937]">{row.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{row.class}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t('updated')}: {row.updated.toLocaleDateString()}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" className="min-h-10 rounded-full" asChild>
                          <Link href={editHref(row)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </Link>
                        </Button>
                        <Button size="sm" variant="secondary" className="min-h-10 rounded-full" asChild>
                          <Link href={previewHref(row)} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" />
                            {t('preview')}
                          </Link>
                        </Button>
                        {row.kind === 'quiz' && (
                          <form action={deleteQuizAction} className="inline">
                            <input type="hidden" name="quizId" value={row.id} />
                            <Button type="submit" size="sm" variant="ghost" className="min-h-10 text-red-600 hover:text-red-700">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('delete')}
                            </Button>
                          </form>
                        )}
                        {row.kind === 'flashcards' && (
                          <form action={deleteFlashcardDeckAction} className="inline">
                            <input type="hidden" name="deckId" value={row.id} />
                            <Button type="submit" size="sm" variant="ghost" className="min-h-10 text-red-600 hover:text-red-700">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('delete')}
                            </Button>
                          </form>
                        )}
                        {row.kind === 'reading' && (
                          <form action={deleteReadingAction} className="inline">
                            <input type="hidden" name="readingId" value={row.id} />
                            <Button type="submit" size="sm" variant="ghost" className="min-h-10 text-red-600 hover:text-red-700">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('delete')}
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
