'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/user';
import {
  markReadingComplete as dbMarkReadingComplete,
  createReading as dbCreateReading,
  updateReading as dbUpdateReading,
  getReadingForTeacher,
} from '@/lib/db/queries/readings';
import { listClassesForTeacher } from '@/lib/db/queries/education';

function linesToArray(s: string | null | undefined): string[] {
  if (!s || typeof s !== 'string') return [];
  return s
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function markReadingCompleteAction(formData: FormData): Promise<void> {
  const readingId = formData.get('readingId');
  if (typeof readingId !== 'string' || !readingId) return;
  const user = await requireRole(['student']);
  const result = await dbMarkReadingComplete(readingId, user.id);
  if (!result.ok) return;
  revalidatePath('/dashboard/student/learning');
  revalidatePath(`/dashboard/student/learning/reading/${readingId}`);
}

export async function createReadingAction(formData: FormData): Promise<void> {
  const user = await requireRole(['teacher', 'admin', 'school_admin']);
  const classId = formData.get('classId');
  const title = formData.get('title');
  const content = formData.get('content');
  if (typeof classId !== 'string' || !classId || typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
    redirect('/dashboard/teacher/learning-tools/readings/new?error=missing');
  }
  const classes = await listClassesForTeacher(user.id);
  if (!classes.some((c) => c.id === classId)) {
    redirect('/dashboard/teacher/learning-tools/readings/new?error=unauthorized');
  }
  const vocabRaw = formData.get('vocabulary');
  const questionsRaw = formData.get('questions');
  const vocab = linesToArray(typeof vocabRaw === 'string' ? vocabRaw : null);
  const questions = linesToArray(typeof questionsRaw === 'string' ? questionsRaw : null);
  const reading = await dbCreateReading({
    classId,
    title: title.trim(),
    content: content.trim(),
    vocab,
    questions,
  });
  revalidatePath('/dashboard/teacher/learning-tools');
  redirect(`/dashboard/teacher/learning-tools/readings/${reading.id}/edit`);
}

export async function updateReadingAction(formData: FormData): Promise<void> {
  const user = await requireRole(['teacher', 'admin', 'school_admin']);
  const readingId = formData.get('readingId');
  const title = formData.get('title');
  const content = formData.get('content');
  if (typeof readingId !== 'string' || !readingId || typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
    redirect(`/dashboard/teacher/learning-tools/readings/${readingId}/edit?error=missing`);
  }
  const existing = await getReadingForTeacher(readingId, user.id);
  if (!existing) {
    redirect('/dashboard/teacher/learning-tools?error=unauthorized');
  }
  const vocabRaw = formData.get('vocabulary');
  const questionsRaw = formData.get('questions');
  const vocab = linesToArray(typeof vocabRaw === 'string' ? vocabRaw : null);
  const questions = linesToArray(typeof questionsRaw === 'string' ? questionsRaw : null);
  await dbUpdateReading(readingId, {
    title: title.trim(),
    content: content.trim(),
    vocab,
    questions,
  });
  revalidatePath('/dashboard/teacher/learning-tools');
  revalidatePath(`/dashboard/teacher/learning-tools/readings/${readingId}/edit`);
  redirect(`/dashboard/teacher/learning-tools/readings/${readingId}/edit`);
}
