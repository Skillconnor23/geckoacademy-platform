import { eq, and, inArray, asc } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  curriculumFiles,
  curriculumWeeks,
  curriculumWeekFiles,
  eduClassTeachers,
} from '../schema';

export type CurriculumFileRow = typeof curriculumFiles.$inferSelect;

export async function listCurriculumFilesForTeacher(
  teacherUserId: number,
  classId: string
): Promise<CurriculumFileRow[]> {
  const [teacherAssignment] = await db
    .select()
    .from(eduClassTeachers)
    .where(
      and(
        eq(eduClassTeachers.teacherUserId, teacherUserId),
        eq(eduClassTeachers.classId, classId)
      )
    )
    .limit(1);
  if (!teacherAssignment) return [];

  return db
    .select()
    .from(curriculumFiles)
    .where(eq(curriculumFiles.classId, classId))
    .orderBy(asc(curriculumFiles.createdAt));
}

export type CurriculumWeekRow = typeof curriculumWeeks.$inferSelect;

export async function getOrCreateCurriculumWeeks(
  teacherUserId: number,
  classId: string
): Promise<CurriculumWeekRow[]> {
  const [teacherAssignment] = await db
    .select()
    .from(eduClassTeachers)
    .where(
      and(
        eq(eduClassTeachers.teacherUserId, teacherUserId),
        eq(eduClassTeachers.classId, classId)
      )
    )
    .limit(1);
  if (!teacherAssignment) return [];

  const existing = await db
    .select()
    .from(curriculumWeeks)
    .where(eq(curriculumWeeks.classId, classId));

  const existingNumbers = new Set(existing.map((w) => w.weekNumber));
  for (let n = 1; n <= 8; n++) {
    if (!existingNumbers.has(n)) {
      await db.insert(curriculumWeeks).values({
        classId,
        weekNumber: n,
        topic: null,
        goals: null,
        notes: null,
        updatedAt: new Date(),
      });
    }
  }

  return db
    .select()
    .from(curriculumWeeks)
    .where(eq(curriculumWeeks.classId, classId))
    .orderBy(asc(curriculumWeeks.weekNumber));
}

export type CurriculumWeekWithAttachments = CurriculumWeekRow & {
  attachments: { fileId: string; originalFilename: string; title: string | null }[];
};

export async function getCurriculumWeeksWithAttachments(
  teacherUserId: number,
  classId: string
): Promise<CurriculumWeekWithAttachments[]> {
  const weeks = await getOrCreateCurriculumWeeks(teacherUserId, classId);
  if (weeks.length === 0) return [];

  const weekIds = weeks.map((w) => w.id);
  const attachments = await db
    .select({
      weekId: curriculumWeekFiles.weekId,
      fileId: curriculumWeekFiles.fileId,
      originalFilename: curriculumFiles.originalFilename,
      title: curriculumFiles.title,
    })
    .from(curriculumWeekFiles)
    .innerJoin(curriculumFiles, eq(curriculumWeekFiles.fileId, curriculumFiles.id))
    .where(inArray(curriculumWeekFiles.weekId, weekIds));

  const byWeek = new Map<
    string,
    { fileId: string; originalFilename: string; title: string | null }[]
  >();
  for (const a of attachments) {
    const list = byWeek.get(a.weekId) ?? [];
    list.push({
      fileId: a.fileId,
      originalFilename: a.originalFilename,
      title: a.title,
    });
    byWeek.set(a.weekId, list);
  }

  return weeks.map((w) => ({
    ...w,
    attachments: byWeek.get(w.id) ?? [],
  }));
}
