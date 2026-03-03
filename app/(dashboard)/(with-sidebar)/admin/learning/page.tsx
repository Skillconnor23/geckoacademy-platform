export const dynamic = 'force-dynamic';

import { getAdminOverviewAction } from '@/lib/actions/quizzes';
import { requireRole } from '@/lib/auth/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminLearningOverviewPage() {
  await requireRole(['admin']);
  const overview = await getAdminOverviewAction();

  return (
    <section className="flex-1">
      <h1 className="text-xl lg:text-2xl font-medium text-[#1f2937] mb-2 tracking-tight">
        Learning overview
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        High-level view of quizzes and performance across classes.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Published quizzes (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#1f2937]">
              {overview.quizzesLast30d}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#1f2937]">
              {overview.avgScore != null ? `${overview.avgScore}%` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Completion rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#1f2937]">
              {overview.completionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent quizzes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.recentQuizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No quizzes published in the last 30 days.
            </p>
          ) : (
            overview.recentQuizzes.map(({ quiz, className }) => (
              <div
                key={quiz.id}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-[#1f2937]">{quiz.title}</p>
                  <p className="text-xs text-muted-foreground">{className}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {quiz.publishedAt && (
                      <span className="inline-flex rounded-full bg-[#ffaa00]/10 px-2.5 py-0.5 font-medium text-[#b64b29]">
                        Published{' '}
                        {new Date(
                          quiz.publishedAt
                        ).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <Button
                    asChild
                    className="w-full sm:w-auto rounded-full bg-[#429ead] text-white hover:border-[#429ead] hover:bg-[#36899a]"
                  >
                    <Link href={`/admin/learning/${quiz.id}`}>View results</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

