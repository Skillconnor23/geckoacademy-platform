export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminHomeworkDetail } from '@/lib/actions/homework';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HomeworkSubmissionRow } from './HomeworkSubmissionRow';

export default async function HomeworkSubmissionsPage({
  params,
}: {
  params: Promise<{ homeworkId: string }>;
}) {
  const { homeworkId } = await params;
  const data = await getAdminHomeworkDetail(homeworkId);
  if (!data) notFound();

  const { hw, className, submissions } = data;

  return (
    <section className="flex-1">
      <div className="mb-6">
        <Link
          href="/dashboard/homework"
          className="text-sm text-muted-foreground hover:text-[#1f2937]"
        >
          ← Back to homework
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-[#1f2937]">
          {hw.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{className}</p>
        <p className="text-sm text-muted-foreground">
          Due:{' '}
          {hw.dueDate
            ? new Date(hw.dueDate).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'No due date'}
        </p>
      </div>

      <Card className="rounded-2xl border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No submissions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(({ submission, studentName, studentEmail }) => (
                  <HomeworkSubmissionRow
                    key={submission.id}
                    submission={submission}
                    studentName={studentName}
                    studentEmail={studentEmail}
                    homeworkId={homeworkId}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
