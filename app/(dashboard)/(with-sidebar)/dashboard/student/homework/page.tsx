export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requireRole } from '@/lib/auth/user';
import { getStudentHomeworkList } from '@/lib/actions/homework';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

export default async function StudentHomeworkListPage() {
  await requireRole(['student']);
  const list = await getStudentHomeworkList();
  if (!list) return null;

  return (
    <section className="flex-1">
      <h1 className="text-lg lg:text-2xl font-medium text-[#1f2937] mb-2">
        Homework
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        View and submit your homework assignments
      </p>

      {list.length === 0 ? (
        <Card className="rounded-2xl border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardContent className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No homework assignments yet. Check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ homework, className, submission }) => (
            <Card
              key={homework.id}
              className="rounded-2xl border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{homework.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{className}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Due:{' '}
                  {homework.dueDate
                    ? new Date(homework.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'No due date'}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      submission
                        ? 'bg-[#7daf41]/20 text-[#7daf41]'
                        : 'bg-amber-500/20 text-amber-700'
                    }`}
                  >
                    {submission
                      ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : 'Not submitted'}
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full w-full"
                >
                  <Link href={`/dashboard/student/homework/${homework.id}`}>
                    Open
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
