'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/user';
import { deleteReading, getReadingForTeacher } from '@/lib/db/queries/readings';
import { deleteQuiz } from '@/lib/db/queries/quizzes';
import { listTeacherQuizzesForUser } from '@/lib/db/queries/quizzes';
import { deleteFlashcardDeck } from '@/lib/db/queries/flashcards';
import { listFlashcardDecksForManager } from '@/lib/db/queries/flashcards';

const LEARNING_TOOLS_PATH = '/dashboard/teacher/learning-tools';

export async function deleteReadingAction(formData: FormData): Promise<void> {
  const readingId = formData.get('readingId');
  if (typeof readingId !== 'string' || !readingId) return;
  const user = await requireRole(['teacher', 'admin', 'school_admin']);
  const reading = await getReadingForTeacher(readingId, user.id);
  if (!reading) return;
  await deleteReading(readingId);
  revalidatePath(LEARNING_TOOLS_PATH);
  revalidatePath(`${LEARNING_TOOLS_PATH}/readings/${readingId}`);
}

export async function deleteQuizAction(formData: FormData): Promise<void> {
  const quizId = formData.get('quizId');
  if (typeof quizId !== 'string' || !quizId) return;
  const user = await requireRole(['teacher', 'admin', 'school_admin']);
  const rows = await listTeacherQuizzesForUser(user.id);
  if (!rows.some((r) => r.quiz.id === quizId)) return;
  await deleteQuiz(quizId);
  revalidatePath(LEARNING_TOOLS_PATH);
  revalidatePath('/teacher/quizzes');
}

export async function deleteFlashcardDeckAction(formData: FormData): Promise<void> {
  const deckId = formData.get('deckId');
  if (typeof deckId !== 'string' || !deckId) return;
  const user = await requireRole(['teacher', 'admin', 'school_admin']);
  const decks = await listFlashcardDecksForManager(user.id, user.platformRole ?? 'teacher');
  if (!decks.some((d) => d.id === deckId)) return;
  await deleteFlashcardDeck(deckId);
  revalidatePath(LEARNING_TOOLS_PATH);
  revalidatePath('/dashboard/teacher/learning/flashcards');
}
