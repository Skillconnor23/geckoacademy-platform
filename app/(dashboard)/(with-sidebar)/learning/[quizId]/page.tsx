export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getQuizForStudentAction, submitQuizAction } from '@/lib/actions/quizzes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, ListChecks } from 'lucide-react';

type Props = {
  params: Promise<{ quizId: string }>;
};

/** Format correct/student answer for display (no scoring logic). */
function formatAnswerDisplay(
  q: { type: string; correctAnswer: unknown; choices?: unknown },
  value: unknown
): string {
  if (value == null) return '—';
  if (q.type === 'TRUE_FALSE') return value === true ? 'True' : 'False';
  if (q.type === 'FILL_BLANK') return typeof value === 'string' ? value : String(value);
  if (q.type === 'MCQ' && Array.isArray(q.choices)) {
    const val = typeof value === 'string' ? value : String(value);
    const choice = (q.choices as { value?: string; label?: string }[]).find(
      (c) => String(c.value) === val || c.value === value
    );
    return choice?.label ?? val;
  }
  return String(value);
}

/** Get correct answer display string. */
function getCorrectAnswerDisplay(q: { type: string; correctAnswer: unknown; choices?: unknown }): string {
  const v = q.correctAnswer;
  if (v == null) return '—';
  if (q.type === 'TRUE_FALSE') return v === true ? 'True' : 'False';
  if (q.type === 'FILL_BLANK') return typeof v === 'string' ? v : String(v);
  if (q.type === 'MCQ' && Array.isArray(q.choices)) {
    const val = typeof v === 'string' ? v : String(v);
    const choice = (q.choices as { value?: string; label?: string }[]).find(
      (c) => String(c.value) === val || c.value === v
    );
    return choice?.label ?? val;
  }
  return String(v);
}

export default async function QuizTakePage({ params }: Props) {
  const { quizId } = await params;
  const locale = await getLocale();
  const data = await getQuizForStudentAction(quizId);
  if (!data) notFound();
  const { quiz, submission } = data;
  const backHref = `/${locale}/dashboard/student/learning?tab=quizzes`;

  const correctCount = submission
    ? quiz.questions.filter((q) => {
        const answer = (submission.answers as { questionId: string; value: unknown }[] | null)?.find(
          (a) => a.questionId === q.id
        );
        const correctVal = q.correctAnswer;
        if (answer && q.type === 'MCQ' && typeof answer.value === 'string' && typeof correctVal === 'string')
          return answer.value === correctVal;
        if (answer && q.type === 'TRUE_FALSE' && typeof correctVal === 'boolean') return answer.value === correctVal;
        if (answer && q.type === 'FILL_BLANK' && typeof answer.value === 'string' && typeof correctVal === 'string')
          return answer.value.trim().toLowerCase() === correctVal.trim().toLowerCase();
        return false;
      }).length
    : 0;

  const totalQuestions = quiz.questions.length;
  const feedbackMessage =
    submission && totalQuestions > 0
      ? submission.score >= 80
        ? 'Great job! You have a strong understanding of this material.'
        : submission.score >= 60
          ? 'Good effort. Review the questions you missed to improve next time.'
          : 'Review the material and try again.'
      : '';

  return (
    <section className="flex-1">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-1">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning
        </Link>
      </Button>

      {submission ? (
        <div className="space-y-8">
          {/* Results summary card */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
            <h1 className="text-xl font-semibold text-[#1f2937] tracking-tight sm:text-2xl">
              {quiz.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Quiz results</p>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Your score</p>
                <p
                  className="mt-1 text-4xl font-bold tabular-nums text-[#1f2937] sm:text-5xl"
                  aria-label={`Score: ${submission.score} percent`}
                >
                  {submission.score}%
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {correctCount} correct out of {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-full sm:w-48 sm:shrink-0">
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#7daf41] transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, submission.score))}%` }}
                    aria-hidden
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Score</p>
              </div>
            </div>

            {feedbackMessage && (
              <p className="mt-4 rounded-xl bg-muted/50 px-4 py-3 text-sm text-[#374151]">
                {feedbackMessage}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="sm" className="rounded-full bg-[#7daf41] hover:bg-[#6b9a38]">
                <Link href={`/${locale}/learning/${quizId}`} className="inline-flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry quiz
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <a href="#quiz-questions" className="inline-flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Review answers
                </a>
              </Button>
            </div>
          </div>

          {/* Question feedback cards */}
          <div id="quiz-questions" className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1f2937]">Review your answers</h2>
            <ul className="space-y-4">
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
                  isCorrect = answer.value.trim().toLowerCase() === correctVal.trim().toLowerCase();
                }
                const studentDisplay = formatAnswerDisplay(q, answer?.value);
                const correctDisplay = getCorrectAnswerDisplay(q);
                return (
                  <li
                    key={q.id}
                    className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6 ${
                      isCorrect ? 'border-[#7daf41]/30' : 'border-red-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Question {index + 1} of {totalQuestions}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          isCorrect
                            ? 'bg-[#7daf41]/15 text-[#5a8a2e]'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="mt-3 font-medium text-[#1f2937]">{q.prompt}</p>
                    <div className="mt-4 space-y-2 rounded-xl bg-muted/30 px-4 py-3">
                      <p className="text-sm">
                        <span className="font-medium text-muted-foreground">Your answer: </span>
                        <span className={isCorrect ? 'text-[#5a8a2e] font-medium' : 'text-[#1f2937]'}>
                          {studentDisplay}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm">
                          <span className="font-medium text-muted-foreground">Correct answer: </span>
                          <span className="font-medium text-[#5a8a2e]">{correctDisplay}</span>
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <form
          action={async (formData) => {
            'use server';
            const answers = quiz.questions.map((q) => {
              const raw = formData.get(`q_${q.id}`);
              let value: unknown = raw;
              if (q.type === 'TRUE_FALSE') {
                value = raw === 'true';
              }
              return {
                questionId: q.id,
                type: q.type as 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK',
                value,
              };
            });

            const result = await submitQuizAction({
              quizId,
              answers,
            });
            if (result.error) {
              throw new Error(result.error);
            }
          }}
          className="space-y-6"
        >
          {quiz.questions.map((q, index) => (
            <div
              key={q.id}
              className="rounded-xl border border-gray-100 bg-white p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Question {index + 1} of {quiz.questions.length}
                </p>
              </div>
              <p className="font-medium text-[#1f2937]">{q.prompt}</p>

              {q.type === 'MCQ' && Array.isArray(q.choices) && (
                <div className="space-y-2">
                  {(q.choices as any[]).map((choice) => (
                    <label
                      key={choice.id ?? choice.value}
                      className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={choice.value}
                        className="h-4 w-4"
                        required
                      />
                      <span>{choice.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'TRUE_FALSE' && (
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'True', value: 'true' },
                    { label: 'False', value: 'false' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={opt.value}
                        className="h-4 w-4"
                        required
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'FILL_BLANK' && (
                <input
                  type="text"
                  name={`q_${q.id}`}
                  className="w-full rounded-full border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Type your answer"
                  required
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            className="w-full rounded-full bg-[#7daf41] text-white hover:border-[#7daf41] hover:bg-[#6c9b38]"
          >
            Submit quiz
          </Button>
        </form>
      )}
    </section>
  );
}

