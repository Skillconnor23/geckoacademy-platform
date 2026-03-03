import { eq, and, gte, asc, sql, inArray } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  eduClasses,
  eduClassTeachers,
  eduEnrollments,
  eduSessions,
  users,
  eduQuizClasses,
  eduQuizzes,
  eduQuizSubmissions,
} from '../schema';

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ATTEMPT_THRESHOLD = 50;

export type TeacherDashboardClass = {
  id: string;
  name: string;
  geckoLevel: string | null;
  scheduleDays: unknown;
  scheduleStartTime: string | null;
  scheduleTimezone: string | null;
  studentCount: number;
  status: 'on_track' | 'needs_attention';
  avgScore30d: number | null;
  attempts30d: number;
};

export type TeacherDashboardKpis = {
  avgQuizScore30d: number | null;
  attemptRate30d: number;
  inactiveStudents: number;
};

export type TeacherDashboardNeedsAttention = {
  inactiveStudents: { studentId: number; studentName: string | null; classId: string }[];
  lowCompletionQuizzes: { quizId: string; quizTitle: string; className: string; attemptPct: number }[];
};

export type TeacherNextSession = {
  sessionId: string;
  classId: string;
  className: string;
  startsAt: Date;
  meetingUrl: string | null;
  title: string | null;
};

export async function getTeacherDashboardClasses(
  teacherUserId: number
): Promise<TeacherDashboardClass[]> {
  const classes = await db
    .select({
      id: eduClasses.id,
      name: eduClasses.name,
      geckoLevel: eduClasses.geckoLevel,
      scheduleDays: eduClasses.scheduleDays,
      scheduleStartTime: eduClasses.scheduleStartTime,
      scheduleTimezone: eduClasses.scheduleTimezone,
    })
    .from(eduClassTeachers)
    .innerJoin(eduClasses, eq(eduClassTeachers.classId, eduClasses.id))
    .where(eq(eduClassTeachers.teacherUserId, teacherUserId))
    .orderBy(asc(eduClasses.name));

  if (classes.length === 0) return [];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);
  const classIds = classes.map((c) => c.id);

  const [studentCounts, attemptStats, avgScores] = await Promise.all([
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
        classId: eduQuizClasses.classId,
        attempted: sql<number>`count(distinct ${eduQuizSubmissions.studentUserId})::int`,
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
    db
      .select({
        classId: eduQuizClasses.classId,
        avgScore: sql<number>`avg(${eduQuizSubmissions.score})::float`,
        attempts30d: sql<number>`count(*)::int`,
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
  ]);

  const studentMap = new Map(studentCounts.map((r) => [r.classId, r.count]));
  const attemptedMap = new Map(attemptStats.map((r) => [r.classId, r.attempted]));
  const avgMap = new Map(
    avgScores.map((r) => [
      r.classId,
      {
        avg: r.avgScore != null ? Math.round(Number(r.avgScore)) : null,
        attempts: r.attempts30d ?? 0,
      },
    ])
  );

  return classes.map((c) => {
    const studentCount = studentMap.get(c.id) ?? 0;
    const attempted = attemptedMap.get(c.id) ?? 0;
    const attemptRate = studentCount > 0 ? Math.round((attempted / studentCount) * 100) : 0;
    const status: 'on_track' | 'needs_attention' =
      studentCount > 0 && attemptRate < ATTEMPT_THRESHOLD
        ? 'needs_attention'
        : 'on_track';
    const { avg: avgScore30d, attempts: attempts30d } = avgMap.get(c.id) ?? {
      avg: null,
      attempts: 0,
    };
    return {
      ...c,
      studentCount,
      status,
      avgScore30d,
      attempts30d,
    };
  });
}

export async function getTeacherDashboardKpis(
  teacherUserId: number
): Promise<TeacherDashboardKpis> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);
  const fourteenDaysAgo = new Date(now.getTime() - FOURTEEN_DAYS_MS);

  const classIds = (
    await db
      .select({ classId: eduClassTeachers.classId })
      .from(eduClassTeachers)
      .where(eq(eduClassTeachers.teacherUserId, teacherUserId))
  ).map((r) => r.classId);

  if (classIds.length === 0) {
    return { avgQuizScore30d: null, attemptRate30d: 0, inactiveStudents: 0 };
  }

  const [avgScore, completionData, inactiveCount] = await Promise.all([
    db
      .select({
        avg: sql<number>`avg(${eduQuizSubmissions.score})::float`,
      })
      .from(eduQuizSubmissions)
      .innerJoin(eduQuizClasses, eq(eduQuizClasses.quizId, eduQuizSubmissions.quizId))
      .where(
        and(
          inArray(eduQuizClasses.classId, classIds),
          gte(eduQuizSubmissions.submittedAt, thirtyDaysAgo)
        )
      ),
    db
      .select({
        attempted: sql<number>`count(distinct ${eduQuizSubmissions.studentUserId})::int`,
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
      ),
    db
      .select({
        total: sql<number>`count(distinct ${eduEnrollments.studentUserId})::int`,
      })
      .from(eduEnrollments)
      .where(
        and(
          eq(eduEnrollments.status, 'active'),
          inArray(eduEnrollments.classId, classIds)
        )
      ),
  ]);

  const studentsWithAttempts = completionData[0]?.attempted ?? 0;
  const totalStudents = inactiveCount[0]?.total ?? 0;
  const attemptRate30d =
    totalStudents > 0 ? Math.round((studentsWithAttempts / totalStudents) * 100) : 0;

  const avgVal = avgScore[0]?.avg;
  const avgQuizScore30d =
    avgVal != null ? Math.round(Number(avgVal)) : null;

  const studentsWithRecentAttempts = await db
    .selectDistinct({ studentId: eduQuizSubmissions.studentUserId })
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
        gte(eduQuizSubmissions.submittedAt, fourteenDaysAgo)
      )
    );
  const recentSet = new Set(studentsWithRecentAttempts.map((r) => r.studentId));
  const allEnrolled = await db
    .select({
      studentId: eduEnrollments.studentUserId,
    })
    .from(eduEnrollments)
    .where(
      and(
        eq(eduEnrollments.status, 'active'),
        inArray(eduEnrollments.classId, classIds)
      )
    );
  const inactiveStudentIds = new Set(
    allEnrolled.filter((r) => !recentSet.has(r.studentId)).map((r) => r.studentId)
  );
  const inactiveStudents = inactiveStudentIds.size;

  return {
    avgQuizScore30d,
    attemptRate30d,
    inactiveStudents,
  };
}

export async function getTeacherDashboardNeedsAttention(
  teacherUserId: number
): Promise<TeacherDashboardNeedsAttention> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);
  const fourteenDaysAgo = new Date(now.getTime() - FOURTEEN_DAYS_MS);

  const classIds = (
    await db
      .select({ classId: eduClassTeachers.classId })
      .from(eduClassTeachers)
      .where(eq(eduClassTeachers.teacherUserId, teacherUserId))
  ).map((r) => r.classId);

  if (classIds.length === 0) {
    return { inactiveStudents: [], lowCompletionQuizzes: [] };
  }

  const studentsWithRecentAttempts = await db
    .selectDistinct({ studentId: eduQuizSubmissions.studentUserId })
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
        gte(eduQuizSubmissions.submittedAt, fourteenDaysAgo)
      )
    );
  const recentSet = new Set(studentsWithRecentAttempts.map((r) => r.studentId));

  const inactiveRows = await db
    .select({
      studentId: eduEnrollments.studentUserId,
      classId: eduEnrollments.classId,
      studentName: users.name,
    })
    .from(eduEnrollments)
    .innerJoin(users, eq(eduEnrollments.studentUserId, users.id))
    .where(
      and(
        eq(eduEnrollments.status, 'active'),
        inArray(eduEnrollments.classId, classIds)
      )
    );

  const inactiveStudents = inactiveRows
    .filter((r) => !recentSet.has(r.studentId))
    .slice(0, 3)
    .map((r) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      classId: r.classId,
    }));

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
        inArray(eduQuizClasses.classId, classIds)
      )
    );

  const lowCompletionQuizzes: { quizId: string; quizTitle: string; className: string; attemptPct: number }[] = [];

  for (const row of quizClassRows) {
    const [enrolled] = await db
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
    const [attempted] = await db
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
    const total = enrolled?.count ?? 0;
    const a = attempted?.count ?? 0;
    const attemptPct = total > 0 ? Math.round((a / total) * 100) : 0;
    if (total > 0 && attemptPct < ATTEMPT_THRESHOLD) {
      lowCompletionQuizzes.push({
        quizId: row.quizId,
        quizTitle: row.quizTitle,
        className: row.className,
        attemptPct,
      });
    }
    if (lowCompletionQuizzes.length >= 3) break;
  }

  return {
    inactiveStudents,
    lowCompletionQuizzes: lowCompletionQuizzes.slice(0, 3),
  };
}

export async function getTeacherNextSession(
  teacherUserId: number
): Promise<TeacherNextSession | null> {
  const now = new Date();
  const [row] = await db
    .select({
      sessionId: eduSessions.id,
      classId: eduClasses.id,
      className: eduClasses.name,
      startsAt: eduSessions.startsAt,
      meetingUrl: eduSessions.meetingUrl,
      title: eduSessions.title,
    })
    .from(eduSessions)
    .innerJoin(eduClasses, eq(eduSessions.classId, eduClasses.id))
    .innerJoin(eduClassTeachers, eq(eduClassTeachers.classId, eduClasses.id))
    .where(
      and(
        eq(eduClassTeachers.teacherUserId, teacherUserId),
        gte(eduSessions.startsAt, now)
      )
    )
    .orderBy(asc(eduSessions.startsAt))
    .limit(1);

  if (!row) return null;

  return {
    sessionId: row.sessionId,
    classId: row.classId,
    className: row.className,
    startsAt: row.startsAt,
    meetingUrl: row.meetingUrl,
    title: row.title,
  };
}
