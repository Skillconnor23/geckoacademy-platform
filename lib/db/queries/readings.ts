import { and, eq, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  eduClasses,
  eduClassTeachers,
  eduEnrollments,
  eduReadingCompletions,
  eduReadings,
} from '../schema';

/** Start of current ISO week (Monday). */
function getThisWeekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** End of current ISO week (Sunday 23:59:59). */
function getThisWeekEnd(): Date {
  const start = getThisWeekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export type ReadingWithMeta = {
  reading: typeof eduReadings.$inferSelect;
  className: string;
  completedAt: Date | null;
};

/**
 * List readings for all of the student's enrolled classes, with completion status.
 * Ordered by weekOf DESC, createdAt DESC.
 */
export async function listReadingsForStudent(
  studentUserId: number
): Promise<ReadingWithMeta[]> {
  const rows = await db
    .select({
      reading: eduReadings,
      className: eduClasses.name,
      completedAt: eduReadingCompletions.completedAt,
    })
    .from(eduReadings)
    .innerJoin(eduClasses, eq(eduReadings.classId, eduClasses.id))
    .innerJoin(
      eduEnrollments,
      and(
        eq(eduEnrollments.classId, eduReadings.classId),
        eq(eduEnrollments.studentUserId, studentUserId),
        eq(eduEnrollments.status, 'active')
      )
    )
    .leftJoin(
      eduReadingCompletions,
      and(
        eq(eduReadingCompletions.readingId, eduReadings.id),
        eq(eduReadingCompletions.studentUserId, studentUserId)
      )
    )
    .orderBy(
      sql`${eduReadings.weekOf} DESC NULLS LAST`,
      sql`${eduReadings.createdAt} DESC`
    );

  return rows.map((r) => ({
    reading: r.reading,
    className: r.className,
    completedAt: r.completedAt,
  }));
}

/** Whether a reading's weekOf falls in the current ISO week. */
export function isReadingThisWeek(weekOf: string | null): boolean {
  if (!weekOf) return false;
  const w = new Date(weekOf);
  const start = getThisWeekStart();
  const end = getThisWeekEnd();
  return w >= start && w <= end;
}

export type ReadingDetailResult = {
  reading: typeof eduReadings.$inferSelect;
  className: string;
  completedAt: Date | null;
};

/**
 * Get a single reading by id for a student (must be in one of their classes).
 */
export async function getReadingDetail(
  readingId: string,
  studentUserId: number
): Promise<ReadingDetailResult | null> {
  const [row] = await db
    .select({
      reading: eduReadings,
      className: eduClasses.name,
      completedAt: eduReadingCompletions.completedAt,
    })
    .from(eduReadings)
    .innerJoin(eduClasses, eq(eduReadings.classId, eduClasses.id))
    .innerJoin(
      eduEnrollments,
      and(
        eq(eduEnrollments.classId, eduReadings.classId),
        eq(eduEnrollments.studentUserId, studentUserId),
        eq(eduEnrollments.status, 'active')
      )
    )
    .leftJoin(
      eduReadingCompletions,
      and(
        eq(eduReadingCompletions.readingId, eduReadings.id),
        eq(eduReadingCompletions.studentUserId, studentUserId)
      )
    )
    .where(eq(eduReadings.id, readingId))
    .limit(1);

  if (!row) return null;
  return {
    reading: row.reading,
    className: row.className,
    completedAt: row.completedAt,
  };
}

/**
 * Mark a reading as complete for a student. Idempotent (upsert).
 */
export async function markReadingComplete(
  readingId: string,
  studentUserId: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const detail = await getReadingDetail(readingId, studentUserId);
  if (!detail) return { ok: false, error: 'Reading not found or access denied' };

  await db
    .insert(eduReadingCompletions)
    .values({
      readingId,
      studentUserId,
    })
    .onConflictDoNothing({
      target: [eduReadingCompletions.readingId, eduReadingCompletions.studentUserId],
    });

  return { ok: true };
}

// --- Teacher: list, get, create, update, delete ---

export type TeacherReadingRow = {
  reading: typeof eduReadings.$inferSelect;
  className: string;
};

/** List readings for classes the teacher is assigned to. */
export async function listReadingsForTeacher(
  teacherUserId: number
): Promise<TeacherReadingRow[]> {
  const rows = await db
    .select({
      reading: eduReadings,
      className: eduClasses.name,
    })
    .from(eduReadings)
    .innerJoin(eduClasses, eq(eduReadings.classId, eduClasses.id))
    .innerJoin(
      eduClassTeachers,
      and(
        eq(eduClassTeachers.classId, eduReadings.classId),
        eq(eduClassTeachers.teacherUserId, teacherUserId)
      )
    )
    .orderBy(sql`${eduReadings.updatedAt} DESC`);
  return rows;
}

/** Get a single reading for edit; teacher must be assigned to the reading's class. */
export async function getReadingForTeacher(
  readingId: string,
  teacherUserId: number
): Promise<{ reading: typeof eduReadings.$inferSelect; className: string } | null> {
  const [row] = await db
    .select({
      reading: eduReadings,
      className: eduClasses.name,
    })
    .from(eduReadings)
    .innerJoin(eduClasses, eq(eduReadings.classId, eduClasses.id))
    .innerJoin(
      eduClassTeachers,
      and(
        eq(eduClassTeachers.classId, eduReadings.classId),
        eq(eduClassTeachers.teacherUserId, teacherUserId)
      )
    )
    .where(eq(eduReadings.id, readingId))
    .limit(1);
  return row ?? null;
}

export async function createReading(data: {
  classId: string;
  title: string;
  description?: string | null;
  content: string;
  weekOf?: string | null;
  vocab?: string[];
  questions?: string[];
}): Promise<typeof eduReadings.$inferSelect> {
  const [created] = await db
    .insert(eduReadings)
    .values({
      classId: data.classId,
      title: data.title,
      description: data.description ?? null,
      content: data.content,
      weekOf: data.weekOf ?? null,
      vocab: data.vocab ?? [],
      questions: data.questions ?? [],
      updatedAt: new Date(),
    })
    .returning();
  return created;
}

export async function updateReading(
  readingId: string,
  data: {
    title?: string;
    description?: string | null;
    content?: string;
    weekOf?: string | null;
    vocab?: string[];
    questions?: string[];
  }
): Promise<typeof eduReadings.$inferSelect | null> {
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) set.title = data.title;
  if (data.description !== undefined) set.description = data.description;
  if (data.content !== undefined) set.content = data.content;
  if (data.weekOf !== undefined) set.weekOf = data.weekOf;
  if (data.vocab !== undefined) set.vocab = data.vocab;
  if (data.questions !== undefined) set.questions = data.questions;
  const [updated] = await db
    .update(eduReadings)
    .set(set as Partial<typeof eduReadings.$inferInsert>)
    .where(eq(eduReadings.id, readingId))
    .returning();
  return updated ?? null;
}

export async function deleteReading(readingId: string): Promise<boolean> {
  const result = await db
    .delete(eduReadings)
    .where(eq(eduReadings.id, readingId))
    .returning({ id: eduReadings.id });
  return result.length > 0;
}
