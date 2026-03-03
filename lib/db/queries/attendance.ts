import { eq, and, desc, gte, lt, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  classSessions,
  attendanceRecords,
  eduClasses,
  eduEnrollments,
  users,
} from '../schema';
import type { AttendanceStatus } from '../schema';

export type ClassSessionWithDate = {
  id: string;
  classId: string;
  startsAt: Date;
  createdAt: Date;
};

/** List sessions for a class, newest first. */
export async function getClassSessions(
  classId: string
): Promise<ClassSessionWithDate[]> {
  const rows = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.classId, classId))
    .orderBy(desc(classSessions.startsAt));
  return rows;
}

export type RosterStudent = {
  studentUserId: number;
  studentName: string | null;
  studentEmail: string;
};

export type AttendanceRecordRow = {
  id: string;
  studentUserId: number;
  status: AttendanceStatus;
  participationScore: number | null;
  teacherNote: string | null;
};

export type SessionAttendanceData = {
  session: ClassSessionWithDate;
  roster: RosterStudent[];
  records: AttendanceRecordRow[];
};

/** Get roster (active enrollments) plus existing attendance records for a session. */
export async function getSessionAttendance(
  sessionId: string
): Promise<SessionAttendanceData | null> {
  const [session] = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.id, sessionId))
    .limit(1);
  if (!session) return null;

  const roster = await db
    .select({
      studentUserId: eduEnrollments.studentUserId,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(eduEnrollments)
    .innerJoin(users, eq(eduEnrollments.studentUserId, users.id))
    .where(
      and(
        eq(eduEnrollments.classId, session.classId),
        eq(eduEnrollments.status, 'active')
      )
    )
    .orderBy(users.name);

  const records = await db
    .select({
      id: attendanceRecords.id,
      studentUserId: attendanceRecords.studentUserId,
      status: attendanceRecords.status,
      participationScore: attendanceRecords.participationScore,
      teacherNote: attendanceRecords.teacherNote,
    })
    .from(attendanceRecords)
    .where(eq(attendanceRecords.sessionId, sessionId));

  return {
    session: {
      id: session.id,
      classId: session.classId,
      startsAt: session.startsAt,
      createdAt: session.createdAt,
    },
    roster: roster.map((r) => ({
      studentUserId: r.studentUserId,
      studentName: r.studentName,
      studentEmail: r.studentEmail,
    })),
    records: records.map((r) => ({
      id: r.id,
      studentUserId: r.studentUserId,
      status: r.status as AttendanceStatus,
      participationScore: r.participationScore,
      teacherNote: r.teacherNote,
    })),
  };
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Get or create today's session for a class. Today is determined by class timezone or UTC. */
export async function getOrCreateTodaySession(classId: string): Promise<{
  session: ClassSessionWithDate;
  created: boolean;
}> {
  const now = new Date();
  const todayStr = toDateOnly(now);

  // Find a session whose starts_at date matches today (in UTC for simplicity)
  const sessions = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.classId, classId))
    .orderBy(desc(classSessions.startsAt));

  const todaySession = sessions.find((s) => {
    const sessionDate = toDateOnly(new Date(s.startsAt));
    return sessionDate === todayStr;
  });

  if (todaySession) {
    return {
      session: {
        id: todaySession.id,
        classId: todaySession.classId,
        startsAt: todaySession.startsAt,
        createdAt: todaySession.createdAt,
      },
      created: false,
    };
  }

  const [created] = await db
    .insert(classSessions)
    .values({
      classId,
      startsAt: now,
    })
    .returning();

  if (!created) throw new Error('Failed to create session');

  return {
    session: {
      id: created.id,
      classId: created.classId,
      startsAt: created.startsAt,
      createdAt: created.createdAt,
    },
    created: true,
  };
}
