import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { StudentAssessmentsProfile } from '@/lib/db/queries/quizzes';

type Props = {
  data: StudentAssessmentsProfile;
  studentId: number;
  viewerRole: 'student' | 'teacher' | 'admin' | 'school_admin';
  /** When provided (e.g. locale-prefixed), used for teacher/admin quiz links instead of default path. */
  quizLinkBase?: string;
};

export function StudentAssessmentsSection({ data, studentId, viewerRole, quizLinkBase: quizLinkBaseOverride }: Props) {
  const isOwnProfile = viewerRole === 'student';
  const quizLinkBase = quizLinkBaseOverride ?? (isOwnProfile
    ? '/learning'
    : `/dashboard/students/${studentId}/quiz`);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Assessments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary row */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Average score:</span>{' '}
            {data.averageScore != null ? `${data.averageScore}%` : '—'}
          </div>
          <div>
            <span className="text-muted-foreground">Quizzes taken:</span>{' '}
            {data.quizzesTaken}
          </div>
          {data.lastQuiz && (
            <div>
              <span className="text-muted-foreground">Last quiz:</span>{' '}
              {data.lastQuiz.title} – {data.lastQuiz.score}%
            </div>
          )}
        </div>

        {/* Quiz results table */}
        {data.results.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No quizzes taken yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.map((r) => (
                <TableRow key={r.submissionId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`${quizLinkBase}/${r.quizId}`}
                      className="text-primary hover:underline"
                    >
                      {r.quizTitle}
                    </Link>
                  </TableCell>
                  <TableCell>{r.className}</TableCell>
                  <TableCell className="text-right">{r.score}%</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(r.submittedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
