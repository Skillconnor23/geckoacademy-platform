import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  homework,
  homeworkSubmissions,
  eduClasses,
  eduEnrollments,
  eduClassTeachers,
  users,
} from '../schema';

/** List homework for a student (from their enrolled classes). */
export async function listHomeworkForStudent(studentUserId: number) {
  const enrollments = await db
    .select({ classId: eduEnrollments.classId })
    .from(eduEnrollments)
    .where(
      and(eq(eduEnrollments.studentUserId, studentUserId), eq(eduEnrollments.status, 'active'))
    );
  const classIds = enrollments.map((e) => e.classId);
  if (classIds.length === 0) return [];

  const rows = await db
    .select({
      hw: homework,
      className: eduClasses.name,
    })
    .from(homework)
    .innerJoin(eduClasses, eq(homework.classId, eduClasses.id))
    .where(inArray(homework.classId, classIds))
    .orderBy(desc(homework.createdAt));

  const submissions = await db
    .select()
    .from(homeworkSubmissions)
    .where(
      and(
        eq(homeworkSubmissions.studentUserId, studentUserId),
        inArray(
          homeworkSubmissions.homeworkId,
          rows.map((r) => r.hw.id)
        )
      )
    );

  const subMap = new Map(submissions.map((s) => [s.homeworkId, s]));

  return rows.map(({ hw, className }) => ({
    homework: hw,
    className,
    submission: subMap.get(hw.id) ?? null,
  }));
}

/** Get homework with student's submission (student must be enrolled in class). */
export async function getHomeworkWithSubmission(homeworkId: string, studentUserId: number) {
  const [row] = await db
    .select({
      hw: homework,
      className: eduClasses.name,
    })
    .from(homework)
    .innerJoin(eduClasses, eq(homework.classId, eduClasses.id))
    .innerJoin(eduEnrollments, eq(eduEnrollments.classId, homework.classId))
    .where(
      and(
        eq(homework.id, homeworkId),
        eq(eduEnrollments.studentUserId, studentUserId),
        eq(eduEnrollments.status, 'active')
      )
    )
    .limit(1);
  if (!row) return null;

  const [sub] = await db
    .select()
    .from(homeworkSubmissions)
    .where(
      and(
        eq(homeworkSubmissions.homeworkId, homeworkId),
        eq(homeworkSubmissions.studentUserId, studentUserId)
      )
    )
    .limit(1);

  return {
    homework: row.hw,
    className: row.className,
    submission: sub ?? null,
  };
}

/** Get homework by id (for admin/teacher). */
export async function getHomeworkById(id: string) {
  const [row] = await db
    .select({
      hw: homework,
      className: eduClasses.name,
    })
    .from(homework)
    .innerJoin(eduClasses, eq(homework.classId, eduClasses.id))
    .where(eq(homework.id, id))
    .limit(1);
  return row ?? null;
}

/** List all homework (admin/teacher). Optionally filter by classIds for teacher. */
export async function listHomeworkForAdmin(classIds?: string[]) {
  const base = db
    .select({
      hw: homework,
      className: eduClasses.name,
    })
    .from(homework)
    .innerJoin(eduClasses, eq(homework.classId, eduClasses.id));
  if (classIds && classIds.length > 0) {
    return base.where(inArray(homework.classId, classIds)).orderBy(desc(homework.createdAt));
  }
  return base.orderBy(desc(homework.createdAt));
}

/** List submissions for a homework (admin/teacher). */
export async function listSubmissionsForHomework(homeworkId: string) {
  return db
    .select({
      submission: homeworkSubmissions,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(homeworkSubmissions)
    .innerJoin(users, eq(homeworkSubmissions.studentUserId, users.id))
    .where(eq(homeworkSubmissions.homeworkId, homeworkId))
    .orderBy(desc(homeworkSubmissions.submittedAt));
}

export type CreateHomeworkData = {
  classId: string;
  title: string;
  instructions?: string | null;
  dueDate?: Date | null;
  attachmentUrl?: string | null;
  createdByUserId: number;
};

export async function createHomework(data: CreateHomeworkData) {
  const [created] = await db
    .insert(homework)
    .values({
      classId: data.classId,
      title: data.title,
      instructions: data.instructions ?? null,
      dueDate: data.dueDate ?? null,
      attachmentUrl: data.attachmentUrl ?? null,
      createdByUserId: data.createdByUserId,
    })
    .returning();
  return created;
}

export async function upsertHomeworkSubmission({
  homeworkId,
  studentUserId,
  textNote,
  files,
}: {
  homeworkId: string;
  studentUserId: number;
  textNote?: string | null;
  files: { url: string; mimeType: string; name: string; size: number }[];
}) {
  const now = new Date();
  const [existing] = await db
    .select()
    .from(homeworkSubmissions)
    .where(
      and(
        eq(homeworkSubmissions.homeworkId, homeworkId),
        eq(homeworkSubmissions.studentUserId, studentUserId)
      )
    )
    .limit(1);
  if (existing) {
    const [updated] = await db
      .update(homeworkSubmissions)
      .set({
        textNote: textNote ?? null,
        files: files,
        submittedAt: now,
      })
      .where(eq(homeworkSubmissions.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(homeworkSubmissions)
    .values({
      homeworkId,
      studentUserId,
      textNote: textNote ?? null,
      files,
      submittedAt: now,
    })
    .returning();
  return created;
}

export async function updateHomeworkSubmissionFeedback({
  submissionId,
  feedback,
  score,
}: {
  submissionId: string;
  feedback?: string | null;
  score?: number | null;
}) {
  const updates: { feedback?: string | null; score?: number | null } = {};
  if (feedback !== undefined) updates.feedback = feedback;
  if (score !== undefined) updates.score = score;
  const [updated] = await db
    .update(homeworkSubmissions)
    .set(updates)
    .where(eq(homeworkSubmissions.id, submissionId))
    .returning();
  return updated;
}
