import { eq, gte, and, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  eduClasses,
  eduClassTeachers,
  eduEnrollments,
  users,
  classroomPosts,
  eduQuizClasses,
  eduQuizSubmissions,
} from '../schema';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type ClassroomSidebarData = {
  classAverage30d: number | null;
  attemptRate30d: number | null;
  lastActivity: string | null;
  teacher: {
    id: number;
    name: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  } | null;
};

/** Class score + teacher for classroom sidebar. */
export async function getClassroomSidebarData(
  classId: string
): Promise<ClassroomSidebarData> {
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const [scoreRow, studentCount, attemptedCount, lastActivityRow, teachers] =
    await Promise.all([
      db
        .select({
          avgScore: sql<number>`avg(${eduQuizSubmissions.score})::float`,
        })
        .from(eduQuizSubmissions)
        .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
        .innerJoin(
          eduEnrollments,
          and(
            eq(eduEnrollments.classId, eduQuizClasses.classId),
            eq(eduEnrollments.studentUserId, eduQuizSubmissions.studentUserId),
            eq(eduEnrollments.status, 'active')
          )
        )
        .where(
          and(
            eq(eduQuizClasses.classId, classId),
            gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo)
          )
        )
        .then((r) => r[0]),
      db
        .select({
          count: sql<number>`count(distinct ${eduEnrollments.studentUserId})::int`,
        })
        .from(eduEnrollments)
        .where(
          and(eq(eduEnrollments.classId, classId), eq(eduEnrollments.status, 'active'))
        )
        .then((r) => r[0]?.count ?? 0),
      db
        .select({
          count: sql<number>`count(distinct ${eduQuizSubmissions.studentUserId})::int`,
        })
        .from(eduQuizSubmissions)
        .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
        .innerJoin(
          eduEnrollments,
          and(
            eq(eduEnrollments.classId, eduQuizClasses.classId),
            eq(eduEnrollments.studentUserId, eduQuizSubmissions.studentUserId),
            eq(eduEnrollments.status, 'active')
          )
        )
        .where(
          and(
            eq(eduQuizClasses.classId, classId),
            gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo)
          )
        )
        .then((r) => r[0]?.count ?? 0),
      (async () => {
        const [postRow] = await db
          .select({
            postMax: sql<Date>`max(${classroomPosts.createdAt})`,
          })
          .from(classroomPosts)
          .where(eq(classroomPosts.classId, classId));
        const [subRow] = await db
          .select({
            subMax: sql<Date>`max(${eduQuizSubmissions.submittedAt})`,
          })
          .from(eduQuizSubmissions)
          .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
          .where(eq(eduQuizClasses.classId, classId));
        const postDate =
          postRow?.postMax != null
            ? new Date(postRow.postMax as string | number | Date)
            : null;
        const subDate =
          subRow?.subMax != null
            ? new Date(subRow.subMax as string | number | Date)
            : null;
        if (!postDate && !subDate) return null;
        if (!postDate) return subDate;
        if (!subDate) return postDate;
        return postDate > subDate ? postDate : subDate;
      })(),
      db
        .select({
          teacherUserId: eduClassTeachers.teacherUserId,
          teacherName: users.name,
          teacherAvatarUrl: users.avatarUrl,
        })
        .from(eduClassTeachers)
        .innerJoin(users, eq(eduClassTeachers.teacherUserId, users.id))
        .where(eq(eduClassTeachers.classId, classId))
        .limit(1),
    ]);

  const total = Number(studentCount);
  const attempted = Number(attemptedCount);
  const attemptRate30d = total > 0 ? Math.round((attempted / total) * 100) : null;
  const rawAvg = scoreRow?.avgScore;
  const classAverage30d =
    rawAvg != null ? Math.round(Number(rawAvg)) : null;

  let lastActivity: string | null = null;
  if (lastActivityRow != null) {
    lastActivity = new Date(lastActivityRow).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  const teacherRow = teachers[0];
  const teacher = teacherRow
    ? {
        id: teacherRow.teacherUserId,
        name: teacherRow.teacherName,
        avatarUrl: teacherRow.teacherAvatarUrl ?? null,
        bio: null as string | null,
      }
    : null;

  return {
    classAverage30d,
    attemptRate30d,
    lastActivity,
    teacher,
  };
}
