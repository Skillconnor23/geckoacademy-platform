import { eq, and, gte, sql, inArray } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  eduClasses,
  eduClassTeachers,
  eduEnrollments,
  users,
  classroomPosts,
  eduQuizClasses,
  eduQuizzes,
  eduQuizSubmissions,
} from '../schema';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type SchoolAdminKpis = {
  activeStudents: number;
  activeClasses: number;
  avgQuizScore7d: number | null;
  avgQuizScore30d: number | null;
  completionRate30d: number;
};

export type SchoolAdminClassRow = {
  classId: string;
  className: string;
  teacherName: string | null;
  studentCount: number;
  avgQuizScore30d: number | null;
  attemptRate30d: number;
  lastActivityAt: Date | null;
  status: 'on_track' | 'needs_attention';
};

export type SchoolAdminNeedsAttention = {
  lowScoreClasses: { classId: string; className: string; avgScore: number }[];
  inactiveStudents: { studentId: number; studentName: string | null }[];
  lowAttemptQuizzes: { quizId: string; quizTitle: string; className: string; attemptPct: number }[];
};

const LOW_SCORE_THRESHOLD = 70;
const LOW_ATTEMPT_THRESHOLD = 50;

/** Scope: when provided, only classes (and their enrollments) in these schools are included. */
export async function getSchoolAdminKpis(schoolIds: string[]): Promise<SchoolAdminKpis> {
  if (schoolIds.length === 0) {
    return {
      activeStudents: 0,
      activeClasses: 0,
      avgQuizScore7d: null,
      avgQuizScore30d: null,
      completionRate30d: 0,
    };
  }
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS_MS);
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);

  const [activeStudentsRow, activeClassesRow, avg7d, avg30d, completionData] =
    await Promise.all([
      db
        .select({
          count: sql<number>`count(distinct ${eduEnrollments.studentUserId})::int`,
        })
        .from(eduEnrollments)
        .innerJoin(eduClasses, eq(eduEnrollments.classId, eduClasses.id))
        .where(
          and(
            eq(eduEnrollments.status, 'active'),
            inArray(eduClasses.schoolId, schoolIds)
          )
        ),
      db
        .select({
          count: sql<number>`count(distinct ${eduEnrollments.classId})::int`,
        })
        .from(eduEnrollments)
        .innerJoin(eduClasses, eq(eduEnrollments.classId, eduClasses.id))
        .where(
          and(
            eq(eduEnrollments.status, 'active'),
            inArray(eduClasses.schoolId, schoolIds)
          )
        ),
      db
        .select({
          avg: sql<number>`avg(${eduQuizSubmissions.score})::float`,
        })
        .from(eduQuizSubmissions)
        .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
        .innerJoin(eduClasses, eq(eduClasses.id, eduQuizClasses.classId))
        .where(
          and(
            gte(eduQuizSubmissions.submittedAt, sevenDaysAgo),
            inArray(eduClasses.schoolId, schoolIds)
          )
        ),
      db
        .select({
          avg: sql<number>`avg(${eduQuizSubmissions.score})::float`,
        })
        .from(eduQuizSubmissions)
        .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
        .innerJoin(eduClasses, eq(eduClasses.id, eduQuizClasses.classId))
        .where(
          and(
            gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo),
            inArray(eduClasses.schoolId, schoolIds)
          )
        ),
      (async () => {
        const [attemptsRow, totalRow] = await Promise.all([
          db
            .select({
              studentsWithAttempts: sql<number>`count(distinct ${eduQuizSubmissions.studentUserId})::int`,
            })
            .from(eduQuizSubmissions)
            .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
            .innerJoin(eduClasses, eq(eduClasses.id, eduQuizClasses.classId))
            .where(
              and(
                gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo),
                inArray(eduClasses.schoolId, schoolIds)
              )
            ),
          db
            .select({
              totalStudents: sql<number>`count(distinct ${eduEnrollments.studentUserId})::int`,
            })
            .from(eduEnrollments)
            .innerJoin(eduClasses, eq(eduEnrollments.classId, eduClasses.id))
            .where(
              and(
                eq(eduEnrollments.status, 'active'),
                inArray(eduClasses.schoolId, schoolIds)
              )
            ),
        ]);
        return [{
          studentsWithAttempts: attemptsRow[0]?.studentsWithAttempts ?? 0,
          totalStudents: totalRow[0]?.totalStudents ?? 0,
        }];
      })(),
    ]);

  const activeStudents = activeStudentsRow[0]?.count ?? 0;
  const activeClasses = activeClassesRow[0]?.count ?? 0;
  const avgQuizScore7d =
    avg7d[0]?.avg != null ? Math.round(Number(avg7d[0].avg)) : null;
  const avgQuizScore30d =
    avg30d[0]?.avg != null ? Math.round(Number(avg30d[0].avg)) : null;

  const studentsWithAttempts = completionData[0]?.studentsWithAttempts ?? 0;
  const totalStudents = completionData[0]?.totalStudents ?? 0;
  const completionRate30d =
    totalStudents > 0
      ? Math.round((studentsWithAttempts / totalStudents) * 100)
      : 0;

  return {
    activeStudents,
    activeClasses,
    avgQuizScore7d,
    avgQuizScore30d,
    completionRate30d,
  };
}

export async function getSchoolAdminClassTable(schoolIds: string[]): Promise<SchoolAdminClassRow[]> {
  if (schoolIds.length === 0) return [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);

  const classes = await db
    .select({
      id: eduClasses.id,
      name: eduClasses.name,
    })
    .from(eduClasses)
    .where(inArray(eduClasses.schoolId, schoolIds))
    .orderBy(eduClasses.name);

  if (classes.length === 0) return [];

  const classIds = classes.map((c) => c.id);

  const [studentCounts, teacherRows, scoreData, lastActivityData] =
    await Promise.all([
      db
        .select({
          classId: eduEnrollments.classId,
          count: sql<number>`count(*)::int`,
        })
        .from(eduEnrollments)
        .where(
          and(
            eq(eduEnrollments.status, 'active'),
            inArray(eduEnrollments.classId, classIds)
          )
        )
        .groupBy(eduEnrollments.classId),
      db
        .select({
          classId: eduClassTeachers.classId,
          teacherName: users.name,
        })
        .from(eduClassTeachers)
        .innerJoin(users, eq(eduClassTeachers.teacherUserId, users.id))
        .where(inArray(eduClassTeachers.classId, classIds)),
      db
        .select({
          classId: eduQuizClasses.classId,
          avgScore: sql<number>`avg(${eduQuizSubmissions.score})::float`,
        })
        .from(eduQuizSubmissions)
        .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
        .innerJoin(eduEnrollments, and(
          eq(eduEnrollments.classId, eduQuizClasses.classId),
          eq(eduEnrollments.studentUserId, eduQuizSubmissions.studentUserId),
          eq(eduEnrollments.status, 'active')
        ))
        .where(
          and(
            inArray(eduQuizClasses.classId, classIds),
            gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo)
          )
        )
        .groupBy(eduQuizClasses.classId),
      Promise.all(
        classIds.map(async (classId) => {
          const [postMax] = await db
            .select({
              maxAt: sql<Date>`max(${classroomPosts.createdAt})`,
            })
            .from(classroomPosts)
            .where(eq(classroomPosts.classId, classId));
          const [subMax] = await db
            .select({
              maxAt: sql<Date>`max(${eduQuizSubmissions.submittedAt})`,
            })
            .from(eduQuizSubmissions)
            .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
            .where(eq(eduQuizClasses.classId, classId));
          const postDate = postMax?.maxAt != null ? new Date(postMax.maxAt as string | number | Date) : null;
          const subDate = subMax?.maxAt != null ? new Date(subMax.maxAt as string | number | Date) : null;
          if (!postDate && !subDate) return { classId, lastActivityAt: null };
          if (!postDate) return { classId, lastActivityAt: subDate };
          if (!subDate) return { classId, lastActivityAt: postDate };
          return {
            classId,
            lastActivityAt: postDate > subDate ? postDate : subDate,
          };
        })
      ),
    ]);

  const studentMap = new Map(studentCounts.map((r) => [r.classId, r.count]));
  const teacherMap = new Map<string, string | null>();
  for (const t of teacherRows) {
    if (!teacherMap.has(t.classId)) {
      teacherMap.set(t.classId, t.teacherName);
    }
  }
  const scoreMap = new Map(
    scoreData.map((r) => [r.classId, r.avgScore != null ? Math.round(Number(r.avgScore)) : null])
  );

  const activityMap = new Map(
    lastActivityData.map((r) => [r.classId, r.lastActivityAt])
  );

  const attemptRates = new Map<string, number>();
  for (const classId of classIds) {
    const [total] = await db
      .select({
        count: sql<number>`count(distinct ${eduEnrollments.studentUserId})::int`,
      })
      .from(eduEnrollments)
      .where(
        and(
          eq(eduEnrollments.classId, classId),
          eq(eduEnrollments.status, 'active')
        )
      );
    const [attempted] = await db
      .select({
        count: sql<number>`count(distinct ${eduQuizSubmissions.studentUserId})::int`,
      })
      .from(eduQuizSubmissions)
      .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
      .innerJoin(eduEnrollments, and(
        eq(eduEnrollments.classId, eduQuizClasses.classId),
        eq(eduEnrollments.studentUserId, eduQuizSubmissions.studentUserId),
        eq(eduEnrollments.status, 'active')
      ))
      .where(
        and(
          eq(eduQuizClasses.classId, classId),
          gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo)
        )
      );
    const t = total?.count ?? 0;
    const a = attempted?.count ?? 0;
    attemptRates.set(classId, t > 0 ? Math.round((a / t) * 100) : 0);
  }

  return classes.map((c) => {
    const studentCount = studentMap.get(c.id) ?? 0;
    const avgScore = scoreMap.get(c.id) ?? null;
    const attemptRate = attemptRates.get(c.id) ?? 0;
    const lastActivityAt = activityMap.get(c.id) ?? null;
    const status: 'on_track' | 'needs_attention' =
      (avgScore != null && avgScore < LOW_SCORE_THRESHOLD) ||
      (studentCount > 0 && attemptRate < LOW_ATTEMPT_THRESHOLD)
        ? 'needs_attention'
        : 'on_track';

    return {
      classId: c.id,
      className: c.name,
      teacherName: teacherMap.get(c.id) ?? null,
      studentCount,
      avgQuizScore30d: avgScore,
      attemptRate30d: attemptRate,
      lastActivityAt,
      status,
    };
  });
}

export async function getSchoolAdminNeedsAttention(schoolIds: string[]): Promise<SchoolAdminNeedsAttention> {
  if (schoolIds.length === 0) {
    return {
      lowScoreClasses: [],
      inactiveStudents: [],
      lowAttemptQuizzes: [],
    };
  }
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);
  const fourteenDaysAgo = new Date(now.getTime() - FOURTEEN_DAYS_MS);

  const classRows = await getSchoolAdminClassTable(schoolIds);
  const classIds = classRows.map((r) => r.classId);
  const lowScoreClasses = classRows
    .filter((r) => r.avgQuizScore30d != null && r.avgQuizScore30d < LOW_SCORE_THRESHOLD)
    .map((r) => ({
      classId: r.classId,
      className: r.className,
      avgScore: r.avgQuizScore30d!,
    }));

  const inactiveStudentRows = await db
    .select({
      studentId: eduEnrollments.studentUserId,
      studentName: users.name,
    })
    .from(eduEnrollments)
    .innerJoin(users, eq(eduEnrollments.studentUserId, users.id))
    .innerJoin(eduClasses, eq(eduEnrollments.classId, eduClasses.id))
    .where(
      and(
        eq(eduEnrollments.status, 'active'),
        inArray(eduClasses.schoolId, schoolIds)
      )
    );

  const studentsWithRecentAttempts = await db
    .selectDistinct({ studentId: eduQuizSubmissions.studentUserId })
    .from(eduQuizSubmissions)
    .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
    .innerJoin(eduClasses, eq(eduClasses.id, eduQuizClasses.classId))
    .where(
      and(
        gte(eduQuizSubmissions.submittedAt, fourteenDaysAgo),
        inArray(eduClasses.schoolId, schoolIds)
      )
    );

  const recentAttemptSet = new Set(
    studentsWithRecentAttempts.map((r) => r.studentId)
  );
  const inactiveStudents = inactiveStudentRows
    .filter((r) => !recentAttemptSet.has(r.studentId))
    .slice(0, 10)
    .map((r) => ({ studentId: r.studentId, studentName: r.studentName }));

  const quizClassRows = await db
    .select({
      quizId: eduQuizClasses.quizId,
      classId: eduQuizClasses.classId,
      quizTitle: eduQuizzes.title,
      className: eduClasses.name,
    })
    .from(eduQuizClasses)
    .innerJoin(eduQuizzes, eq(eduQuizzes.id, eduQuizClasses.quizId))
    .innerJoin(eduClasses, eq(eduClasses.id, eduQuizClasses.classId))
    .where(
      and(
        eq(eduQuizzes.status, 'PUBLISHED'),
        inArray(eduClasses.schoolId, schoolIds)
      )
    );

  const lowAttemptQuizzes: { quizId: string; quizTitle: string; className: string; attemptPct: number }[] = [];

  for (const row of quizClassRows) {
    const [enrolledCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(eduEnrollments)
      .where(
        and(
          eq(eduEnrollments.classId, row.classId),
          eq(eduEnrollments.status, 'active')
        )
      );

    const [attemptedCount] = await db
      .select({
        count: sql<number>`count(distinct ${eduQuizSubmissions.studentUserId})::int`,
      })
      .from(eduQuizSubmissions)
      .innerJoin(eduEnrollments, and(
        eq(eduEnrollments.classId, row.classId),
        eq(eduEnrollments.studentUserId, eduQuizSubmissions.studentUserId),
        eq(eduEnrollments.status, 'active')
      ))
      .where(
        and(
          eq(eduQuizSubmissions.quizId, row.quizId),
          gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo)
        )
      );

    const total = enrolledCount?.count ?? 0;
    const attempted = attemptedCount?.count ?? 0;
    const attemptPct = total > 0 ? Math.round((attempted / total) * 100) : 0;
    if (total > 0 && attemptPct < LOW_ATTEMPT_THRESHOLD) {
      lowAttemptQuizzes.push({
        quizId: row.quizId,
        quizTitle: row.quizTitle,
        className: row.className,
        attemptPct,
      });
    }
  }

  return {
    lowScoreClasses,
    inactiveStudents: inactiveStudents.slice(0, 10),
    lowAttemptQuizzes: lowAttemptQuizzes.slice(0, 10),
  };
}
