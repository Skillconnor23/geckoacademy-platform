export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { getUserById } from '@/lib/db/queries/education';
import { isStudentInTeacherClass, hasStudentEnrollment } from '@/lib/db/queries/education';
import { getQuizSubmissionForViewerAction } from '@/lib/actions/quizzes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  params: Promise<{ studentId: string; quizId: string }>;
};

export default async function StudentQuizAttemptPage({ params }: Props) {
  const { studentId, quizId } = await params;
  const studentIdNum = parseInt(studentId, 10);
  if (isNaN(studentIdNum) || studentIdNum <= 0) notFound();

  const currentUser = await getUser();
  if (!currentUser) notFound();

  const role = currentUser.platformRole as string | null;
  if (role === 'student') notFound();

  if (role === 'teacher') {
    const canView = await isStudentInTeacherClass(currentUser.id, studentIdNum);
    if (!canView) notFound();
  } else if (role === 'school_admin') {
    const canView = await hasStudentEnrollment(studentIdNum, currentUser.id);
    if (!canView) notFound();
  } else if (role !== 'admin') {
    notFound();
  }

  const [student, result] = await Promise.all([
    getUserById(studentIdNum),
    getQuizSubmissionForViewerAction(quizId, studentIdNum),
  ]);

  if (!student || 'error' in result) notFound();

  const { quiz, submission } = result;

  const studentName = student.name ?? student.email;

  return (
    <section className="flex-1">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-1">
        <Link
          href={`/dashboard/students/${studentId}`}
          className="flex items-center gap-1 text-muted-foreground"
        >
          ← Back to student
        </Link>
      </Button>

      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-medium text-[#1f2937] tracking-tight">
          {quiz.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {studentName}&apos;s attempt
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Score</p>
            <p className="text-3xl font-semibold text-[#7daf41]">
              {submission.score}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Submitted {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {quiz.questions.map((q, index) => {
            const answer = (submission.answers as { questionId: string; value: unknown }[] | null)?.find(
              (a) => a.questionId === q.id
            );
            const correctVal = q.correctAnswer;
            let isCorrect = false;
            if (answer && q.type === 'MCQ' && typeof answer.value === 'string' && typeof correctVal === 'string') {
              isCorrect = answer.value === correctVal;
            } else if (answer && q.type === 'TRUE_FALSE' && typeof correctVal === 'boolean') {
              isCorrect = answer.value === correctVal;
            } else if (answer && q.type === 'FILL_BLANK' && typeof answer.value === 'string' && typeof correctVal === 'string') {
              isCorrect = (answer.value as string).trim().toLowerCase() === (correctVal as string).trim().toLowerCase();
            }
            return (
              <div
                key={q.id}
                className="rounded-xl border border-gray-100 bg-white p-4 space-y-2"
              >
                <p className="text-xs text-muted-foreground">
                  Question {index + 1} of {quiz.questions.length}
                </p>
                <p className="font-medium text-[#1f2937]">{q.prompt}</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isCorrect
                      ? 'bg-[#7daf41]/10 text-[#7daf41]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
