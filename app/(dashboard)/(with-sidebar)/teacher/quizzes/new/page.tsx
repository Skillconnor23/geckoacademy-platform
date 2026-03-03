import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/user';
import { getClassesForTeacherWithDetails } from '@/lib/db/queries/education';
import { createQuizAction } from '@/lib/actions/quizzes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Props = { searchParams: Promise<{ classId?: string; error?: string }> };

export default async function NewQuizPage({ searchParams }: Props) {
  const user = await requireRole(['teacher']);
  const classes = await getClassesForTeacherWithDetails(user.id);
  const { classId: queryClassId, error: queryError } = await searchParams;
  const validClassIds = new Set(classes.map((c) => c.id));
  const preselectedIds = queryClassId && validClassIds.has(queryClassId) ? [queryClassId] : [];

  if (classes.length === 0) {
    redirect('/dashboard/teacher');
  }

  return (
    <section className="flex-1">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-1">
        <Link href="/teacher/quizzes" className="flex items-center gap-1 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Link>
      </Button>
      <h1 className="text-xl lg:text-2xl font-medium text-[#1f2937] mb-2 tracking-tight">
        New quiz
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Create a quiz and assign it to one or more classes.
      </p>

      {queryError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {queryError}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Quiz details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createQuizAction} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1f2937]">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                className="w-full rounded-full border border-gray-200 px-3 py-2 text-sm"
                placeholder="e.g. Week 3 vocabulary quiz"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1f2937]">
                Description (optional)
              </label>
              <textarea
                name="description"
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                rows={3}
                placeholder="Short note about this quiz."
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1f2937]">
                Assign to classes <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1">
                Select at least one class
              </p>
              <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 p-3">
                {classes.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="classIds"
                      value={c.id}
                      defaultChecked={preselectedIds.includes(c.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[#429ead] text-white hover:border-[#429ead] hover:bg-[#36899a]"
            >
              Save quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
