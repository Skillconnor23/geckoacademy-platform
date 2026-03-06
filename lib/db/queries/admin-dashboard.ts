import { eq, and, gte, lte, sql, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  users,
  schools,
  eduClasses,
  eduClassTeachers,
  eduEnrollments,
  eduSessions,
  classInvites,
} from '../schema';

export type AdminDashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  activeClasses: number;
  pendingInvites: number;
  lessonsThisWeek: number;
};

export type AdminNeedsAttention = {
  classesWithoutTeachers: { id: string; name: string }[];
  teachersWithNoClasses: { id: number; name: string | null; email: string }[];
  schoolsWithNoClasses: { id: string; name: string }[];
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  const dayOfWeek = startOfWeek.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const [
    studentsRow,
    teachersRow,
    schoolsRow,
    classesRow,
    invitesRow,
    sessionsRow,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.platformRole, 'student'), isNull(users.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.platformRole, 'teacher'), isNull(users.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schools)
      .where(eq(schools.isArchived, false)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(eduClasses)
      .where(eq(eduClasses.isArchived, false)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(classInvites)
      .where(eq(classInvites.isActive, true)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(eduSessions)
      .where(
        and(
          gte(eduSessions.startsAt, startOfWeek),
          lte(eduSessions.startsAt, endOfWeek)
        )
      ),
  ]);

  return {
    totalStudents: studentsRow[0]?.count ?? 0,
    totalTeachers: teachersRow[0]?.count ?? 0,
    totalSchools: schoolsRow[0]?.count ?? 0,
    activeClasses: classesRow[0]?.count ?? 0,
    pendingInvites: invitesRow[0]?.count ?? 0,
    lessonsThisWeek: sessionsRow[0]?.count ?? 0,
  };
}

export async function getAdminNeedsAttention(): Promise<AdminNeedsAttention> {
  const activeClasses = await db
    .select({ id: eduClasses.id, name: eduClasses.name })
    .from(eduClasses)
    .where(eq(eduClasses.isArchived, false));

  const classesWithTeachers = await db
    .selectDistinct({ classId: eduClassTeachers.classId })
    .from(eduClassTeachers)
    .where(eq(eduClassTeachers.isActive, true));

  const classesWithTeacherSet = new Set(
    classesWithTeachers.map((r) => r.classId)
  );

  const classesWithoutTeachers = activeClasses.filter(
    (c) => !classesWithTeacherSet.has(c.id)
  );

  const teachersWithActiveClasses = await db
    .selectDistinct({ teacherUserId: eduClassTeachers.teacherUserId })
    .from(eduClassTeachers)
    .where(eq(eduClassTeachers.isActive, true));

  const teacherIdsWithClasses = new Set(
    teachersWithActiveClasses.map((r) => r.teacherUserId)
  );

  const allTeachers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.platformRole, 'teacher'), isNull(users.deletedAt)));

  const teachersWithNoClasses = allTeachers.filter(
    (t) => !teacherIdsWithClasses.has(t.id)
  );

  const schoolsList = await db
    .select({ id: schools.id, name: schools.name })
    .from(schools)
    .where(eq(schools.isArchived, false));

  const classCountBySchool = await db
    .select({
      schoolId: eduClasses.schoolId,
      count: sql<number>`count(*)::int`,
    })
    .from(eduClasses)
    .where(eq(eduClasses.isArchived, false))
    .groupBy(eduClasses.schoolId);

  const schoolIdsWithClasses = new Set(
    classCountBySchool
      .filter((r) => r.schoolId != null && r.count > 0)
      .map((r) => r.schoolId!)
  );

  const schoolsWithNoClasses = schoolsList.filter(
    (s) => !schoolIdsWithClasses.has(s.id)
  );

  return {
    classesWithoutTeachers: classesWithoutTeachers.map((c) => ({
      id: c.id,
      name: c.name,
    })),
    teachersWithNoClasses: teachersWithNoClasses.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
    })),
    schoolsWithNoClasses: schoolsWithNoClasses.map((s) => ({
      id: s.id,
      name: s.name,
    })),
  };
}
