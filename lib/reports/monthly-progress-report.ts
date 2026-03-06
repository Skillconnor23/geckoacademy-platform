import type { PlatformRole } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { getUserById, getAllEnrollmentsForStudent, isStudentInTeacherClass, hasStudentEnrollment } from '@/lib/db/queries/education';
import { getStudentAttendanceMonthSummary, getStudentAttendanceMonthSessions } from '@/lib/db/queries/attendance';
import { db } from '@/lib/db/drizzle';
import {
  users,
  eduClasses,
  eduEnrollments,
  eduClassTeachers,
  eduQuizSubmissions,
  eduReadings,
  eduReadingCompletions,
  homework,
  homeworkSubmissions,
} from '@/lib/db/schema';
import { and, eq, gte, lte, sql, count, inArray } from 'drizzle-orm';
import { monthKeyToRange } from '@/lib/db/queries/attendance';

export type MonthlyReportPermission =
  | { allowed: true; role: PlatformRole }
  | { allowed: false; error: string };

/** Server-side: can the current user access the monthly report for this student? */
export async function canAccessStudentReport(
  studentId: number
): Promise<MonthlyReportPermission> {
  const user = await getUser();
  if (!user) return { allowed: false, error: 'Not signed in.' };

  const role = user.platformRole as PlatformRole | null;
  if (!role) return { allowed: false, error: 'No role.' };

  if (role === 'student') {
    if (user.id !== studentId) return { allowed: false, error: 'You can only view your own report.' };
    return { allowed: true, role: 'student' };
  }

  if (role === 'admin') return { allowed: true, role: 'admin' };

  if (role === 'school_admin') {
    const ok = await hasStudentEnrollment(studentId);
    if (!ok) return { allowed: false, error: 'Student not in your school.' };
    return { allowed: true, role: 'school_admin' };
  }

  if (role === 'teacher') {
    const ok = await isStudentInTeacherClass(user.id, studentId);
    if (!ok) return { allowed: false, error: 'Student not in your classes.' };
    return { allowed: true, role: 'teacher' };
  }

  return { allowed: false, error: 'Access denied.' };
}

export type MonthlyReportData = {
  studentName: string;
  studentEmail: string;
  className: string | null;
  teacherName: string | null;
  monthLabel: string;
  monthKey: string;
  attendanceRate: number;
  attendanceTotalSessions: number;
  attendancePresentLate: number;
  averageQuizScore: number | null;
  quizAttemptsCount: number;
  homeworkCompletionRate: number | null;
  homeworkTotal: number;
  homeworkCompleted: number;
  readingCompletionsCount: number;
  participationAvg: number | null;
  teacherNotes: string[];
  summaryLines: string[];
};

/** Get teacher name for a class (first assigned teacher). */
async function getTeacherNameForClass(classId: string): Promise<string | null> {
  const row = await db
    .select({ name: users.name })
    .from(eduClassTeachers)
    .innerJoin(users, eq(eduClassTeachers.teacherUserId, users.id))
    .where(eq(eduClassTeachers.classId, classId))
    .limit(1);
  return row[0]?.name ?? null;
}

/** Format month key as "Month YYYY". */
function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Aggregate monthly progress data for a student. */
export async function getMonthlyReportData(
  studentId: number,
  monthKey: string
): Promise<MonthlyReportData | null> {
  const { monthStart, monthEnd } = monthKeyToRange(monthKey);

  const [student, enrollments, attendanceSummary, attendanceSessions] = await Promise.all([
    getUserById(studentId),
    getAllEnrollmentsForStudent(studentId),
    getStudentAttendanceMonthSummary(studentId, monthKey),
    getStudentAttendanceMonthSessions(studentId, monthKey),
  ]);

  if (!student || (student.platformRole as string) !== 'student') return null;

  const primaryEnrollment = enrollments[0];
  const classId = primaryEnrollment?.class?.id ?? null;
  const className = primaryEnrollment?.class?.name ?? null;
  const teacherName = classId ? await getTeacherNameForClass(classId) : null;

  const presentLate = attendanceSummary.presentCount + attendanceSummary.lateCount;

  const quizInMonth = await db
    .select({
      avgScore: sql<number | null>`round(avg(${eduQuizSubmissions.score})::numeric)::int`,
      count: count(eduQuizSubmissions.id),
    })
    .from(eduQuizSubmissions)
    .where(
      and(
        eq(eduQuizSubmissions.studentUserId, studentId),
        gte(eduQuizSubmissions.submittedAt, monthStart),
        lte(eduQuizSubmissions.submittedAt, monthEnd)
      )
    )
    .then((r) => r[0]);

  const classIds = enrollments.map((e) => e.class.id);
  let homeworkTotal = 0;
  let homeworkCompleted = 0;
  if (classIds.length > 0) {
    const homeworkInMonth = await db
      .select({ id: homework.id })
      .from(homework)
      .where(
        and(
          inArray(homework.classId, classIds),
          gte(homework.dueDate, monthStart),
          lte(homework.dueDate, monthEnd)
        )
      );
    homeworkTotal = homeworkInMonth.length;
    if (homeworkInMonth.length > 0) {
      const hwIds = homeworkInMonth.map((h) => h.id);
      const submitted = await db
        .select({ count: count(homeworkSubmissions.id) })
        .from(homeworkSubmissions)
        .where(
          and(
            eq(homeworkSubmissions.studentUserId, studentId),
            inArray(homeworkSubmissions.homeworkId, hwIds)
          )
        )
        .then((r) => Number(r[0]?.count ?? 0));
      homeworkCompleted = submitted;
    }
  }

  let readingCount = 0;
  if (classIds.length > 0) {
    readingCount = await db
      .select({ count: count(eduReadingCompletions.id) })
      .from(eduReadingCompletions)
      .innerJoin(eduReadings, eq(eduReadingCompletions.readingId, eduReadings.id))
      .where(
        and(
          eq(eduReadingCompletions.studentUserId, studentId),
          inArray(eduReadings.classId, classIds),
          gte(eduReadingCompletions.completedAt, monthStart),
          lte(eduReadingCompletions.completedAt, monthEnd)
        )
      )
      .then((r) => Number(r[0]?.count ?? 0));
  }

  const teacherNotes = attendanceSessions
    .map((s) => s.teacherNote)
    .filter((n): n is string => !!n && n.trim().length > 0);

  const summaryLines: string[] = [];
  if (attendanceSummary.totalSessions > 0) {
    summaryLines.push(
      `Attendance: ${Math.round(attendanceSummary.attendanceRate * 100)}% (${presentLate}/${attendanceSummary.totalSessions} sessions)`
    );
  }
  if (quizInMonth?.count && Number(quizInMonth.count) > 0 && quizInMonth.avgScore != null) {
    summaryLines.push(`Quiz average: ${quizInMonth.avgScore}% (${quizInMonth.count} attempt(s))`);
  }
  if (homeworkTotal > 0) {
    const rate = Math.round((homeworkCompleted / homeworkTotal) * 100);
    summaryLines.push(`Homework: ${rate}% (${homeworkCompleted}/${homeworkTotal} completed)`);
  }
  if (readingCount > 0) {
    summaryLines.push(`Reading: ${readingCount} assignment(s) completed`);
  }
  if (attendanceSummary.participationAvg != null) {
    summaryLines.push(`Participation average: ${Math.round(attendanceSummary.participationAvg)}/5`);
  }

  return {
    studentName: student.name ?? student.email ?? 'Student',
    studentEmail: student.email,
    className,
    teacherName,
    monthLabel: formatMonthLabel(monthKey),
    monthKey,
    attendanceRate: attendanceSummary.attendanceRate,
    attendanceTotalSessions: attendanceSummary.totalSessions,
    attendancePresentLate: presentLate,
    averageQuizScore: quizInMonth?.avgScore != null ? Number(quizInMonth.avgScore) : null,
    quizAttemptsCount: Number(quizInMonth?.count ?? 0),
    homeworkCompletionRate:
      homeworkTotal > 0 ? homeworkCompleted / homeworkTotal : null,
    homeworkTotal,
    homeworkCompleted,
    readingCompletionsCount: readingCount,
    participationAvg: attendanceSummary.participationAvg,
    teacherNotes,
    summaryLines,
  };
}
