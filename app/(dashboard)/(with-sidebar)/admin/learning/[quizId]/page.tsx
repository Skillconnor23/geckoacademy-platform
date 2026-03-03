export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth/user';
import { getTeacherQuizResultsAction } from '@/lib/actions/quizzes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Props = { params: Promise<{ quizId: string }> };

export default async function AdminQuizDetailPage({ params }: Props) {
  const { quizId } = await params;
  await requireRole(['admin', 'school_admin']);
  const data = await getTeacherQuizResultsAction(quizId);
  const { quiz, submissions } = data;

  const submittedCount = submissions.length;
  const avgScore =
    submittedCount === 0
      ? null
      : Math.round(
          submissions.reduce((acc, s) => acc + s.submission.score, 0) /
            submittedCount
        );

  return (
    <section className="flex-1">
      <h1 className="text-xl lg:text-2xl font-medium text-[#1f2937] mb-2 tracking-tight">
        Quiz overview
      </h1>
      <p className="text-sm text-muted-foreground mb-6">{quiz.title}</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#1f2937]">
                {submittedCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Average score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#1f2937]">
                {avgScore != null ? `${avgScore}%` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student scores</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submissions yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map(({ submission, student }) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {student.name || student.email}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          submission.submittedAt
                        ).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {submission.score}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

