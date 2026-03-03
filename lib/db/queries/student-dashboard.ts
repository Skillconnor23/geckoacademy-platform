import { and, avg, count, eq, gte, inArray, isNotNull, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  eduClasses,
  eduEnrollments,
  eduQuizClasses,
  eduQuizzes,
  eduQuizSubmissions,
} from '../schema';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type StudentDashboardStats = {
  avgScore30d: number | null;
  quizzesCompleted: number;
  activeDays30d: number;
  lastActivityDays: number | null;
};

/** KPIs for student dashboard: avg quiz score (30d), quizzes completed, active days, last activity. */
export async function getStudentDashboardStats(
  studentUserId: number
): Promise<StudentDashboardStats> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);

  const [statsRow, lastSubmission] = await Promise.all([
    db
      .select({
        avgScore: avg(eduQuizSubmissions.score),
        quizCount: count(eduQuizSubmissions.id),
        activeDays: sql<number>`count(distinct date(${eduQuizSubmissions.submittedAt}))::int`,
      })
      .from(eduQuizSubmissions)
      .where(
        and(
          eq(eduQuizSubmissions.studentUserId, studentUserId),
          gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo)
        )
      )
      .then((rows) => rows[0]),
    db
      .select({ submittedAt: eduQuizSubmissions.submittedAt })
      .from(eduQuizSubmissions)
      .where(eq(eduQuizSubmissions.studentUserId, studentUserId))
      .orderBy(sql`${eduQuizSubmissions.submittedAt} DESC`)
      .limit(1)
      .then((rows) => rows[0]),
  ]);

  const quizzesCompleted =
    (await db
      .select({ count: count(eduQuizSubmissions.id) })
      .from(eduQuizSubmissions)
      .where(eq(eduQuizSubmissions.studentUserId, studentUserId)))
      [0]?.count ?? 0;

  const rawAvg = statsRow?.avgScore;
  const avgScore30d =
    rawAvg != null && Number(statsRow?.quizCount ?? 0) > 0
      ? Math.round(Number(rawAvg))
      : null;

  const activeDays30d = Number(statsRow?.activeDays ?? 0);

  let lastActivityDays: number | null = null;
  if (lastSubmission?.submittedAt) {
    const last = new Date(lastSubmission.submittedAt).getTime();
    lastActivityDays = Math.floor((now.getTime() - last) / (24 * 60 * 60 * 1000));
  }

  return {
    avgScore30d,
    quizzesCompleted: Number(quizzesCompleted),
    activeDays30d,
    lastActivityDays,
  };
}

export type StudentNeedsAttention = {
  incompleteQuizzes: { quizId: string; quizTitle: string; className: string }[];
  noActivityIn7Days: boolean;
};

/** Quizzes assigned to student's classes that they haven't completed; and no-activity flag. */
export async function getStudentNeedsAttention(
  studentUserId: number
): Promise<StudentNeedsAttention> {
  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

  const [enrolledClasses, submittedQuizIds, lastSubmission] = await Promise.all([
    db
      .select({ classId: eduEnrollments.classId })
      .from(eduEnrollments)
      .where(
        and(
          eq(eduEnrollments.studentUserId, studentUserId),
          eq(eduEnrollments.status, 'active')
        )
      ),
    db
      .selectDistinct({ quizId: eduQuizSubmissions.quizId })
      .from(eduQuizSubmissions)
      .where(eq(eduQuizSubmissions.studentUserId, studentUserId)),
    db
      .select({ submittedAt: eduQuizSubmissions.submittedAt })
      .from(eduQuizSubmissions)
      .where(eq(eduQuizSubmissions.studentUserId, studentUserId))
      .orderBy(sql`${eduQuizSubmissions.submittedAt} DESC`)
      .limit(1)
      .then((r) => r[0]),
  ]);

  const classIds = enrolledClasses.map((c) => c.classId);
  const completedIds = new Set(submittedQuizIds.map((s) => s.quizId));

  const assigned =
    classIds.length === 0
      ? []
      : await db
          .select({
            quizId: eduQuizClasses.quizId,
            quizTitle: eduQuizzes.title,
            className: eduClasses.name,
          })
          .from(eduQuizClasses)
          .innerJoin(eduQuizzes, eq(eduQuizClasses.quizId, eduQuizzes.id))
          .innerJoin(eduClasses, eq(eduQuizClasses.classId, eduClasses.id))
          .where(
            and(
              eq(eduQuizzes.status, 'PUBLISHED'),
              isNotNull(eduQuizzes.publishedAt),
              inArray(eduQuizClasses.classId, classIds)
            )
          );

  const incompleteQuizzes = assigned
    .filter((q) => !completedIds.has(q.quizId))
    .map((q) => ({
      quizId: q.quizId,
      quizTitle: q.quizTitle ?? 'Quiz',
      className: q.className,
    }));

  const noActivityIn7Days =
    !lastSubmission?.submittedAt ||
    new Date(lastSubmission.submittedAt).getTime() < sevenDaysAgo.getTime();

  return {
    incompleteQuizzes,
    noActivityIn7Days,
  };
}
