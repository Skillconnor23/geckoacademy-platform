/**
 * Wipes all demo data (users with @demo.com and their related content).
 * Safe to run multiple times.
 *
 * Usage: pnpm run clear:demo
 * Safety: Blocked in NODE_ENV=production unless DEMO_SEED=true.
 */

import 'dotenv/config';
import { db } from '../lib/db/drizzle';
import {
  users,
  eduClasses,
  eduClassTeachers,
  eduEnrollments,
  eduSessions,
  classSessions,
  attendanceRecords,
  flashcardDecks,
  flashcardCards,
  flashcardSaves,
  flashcardStudyEvents,
  homework,
  homeworkSubmissions,
  classroomPosts,
} from '../lib/db/schema';
import { eq, like, inArray } from 'drizzle-orm';

const DEMO_EMAIL_PATTERN = '%@demo.com';

function assertSafeToRun() {
  const isProd = process.env.NODE_ENV === 'production';
  const demoSeed = process.env.DEMO_SEED === 'true' || process.env.DEMO_SEED === '1';
  if (isProd && !demoSeed) {
    throw new Error(
      'Clear demo is blocked in production. Set DEMO_SEED=true to override.'
    );
  }
}

async function main() {
  assertSafeToRun();

  const demoUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(like(users.email, DEMO_EMAIL_PATTERN));

  const demoUserIds = demoUsers.map((u) => u.id);
  if (demoUserIds.length === 0) {
    console.log('No demo users found. Nothing to clear.');
    return;
  }

  // Get demo class IDs (classes whose teachers are demo users, or we can get all classes
  // that have demo enrollments - actually demo classes are only those created by seed.
  // We identify demo content by: users with @demo.com. Related data cascades from there.
  // But homework, flashcardDecks, etc. reference users and classes. Classes don't have
  // a "demo" flag - they're linked via eduClassTeachers (demo teachers) and eduEnrollments (demo students).
  // So we need to: 1) Find classes where ALL teachers are demo users, 2) Or find classes
  // that only have demo enrollments. Actually the cleanest approach: find class IDs that
  // have any demo teacher or any demo enrollment. But that could include non-demo classes
  // with one demo student. The seed creates classes that are ONLY used by demo users.
  // So: get class IDs from eduClassTeachers where teacherUserId in demoUserIds,
  // union with eduEnrollments where studentUserId in demoUserIds. Those are "demo" classes.
  const teacherClassRows = await db
    .selectDistinct({ classId: eduClassTeachers.classId })
    .from(eduClassTeachers)
    .where(inArray(eduClassTeachers.teacherUserId, demoUserIds));
  const studentClassRows = await db
    .selectDistinct({ classId: eduEnrollments.classId })
    .from(eduEnrollments)
    .where(inArray(eduEnrollments.studentUserId, demoUserIds));
  const demoClassIds = [...new Set([
    ...teacherClassRows.map((r) => r.classId),
    ...studentClassRows.map((r) => r.classId),
  ])];

  console.log(`Clearing demo data: ${demoUsers.length} users, ${demoClassIds.length} classes...`);

  // Delete in FK order (children first)
  // homeworkSubmissions -> homework, users
  // homework -> classes
  // flashcardStudyEvents -> users, decks, cards
  // flashcardSaves -> users, cards
  // attendanceRecords -> classSessions, users
  // classSessions -> classes
  // eduSessions -> classes
  // eduEnrollments -> classes, users
  // eduClassTeachers -> classes, users
  // flashcardCards -> decks
  // flashcardDecks -> classes, users
  // Then classes, then users

  if (demoClassIds.length > 0) {
    // Homework submissions for homework in demo classes
    const demoHomework = await db.select({ id: homework.id }).from(homework).where(inArray(homework.classId, demoClassIds));
    const demoHwIds = demoHomework.map((h) => h.id);
    if (demoHwIds.length > 0) {
      await db.delete(homeworkSubmissions).where(inArray(homeworkSubmissions.homeworkId, demoHwIds));
    }
    await db.delete(homework).where(inArray(homework.classId, demoClassIds));

    // Flashcard deck/cards/events/saves for demo classes
    const demoDecks = await db.select({ id: flashcardDecks.id }).from(flashcardDecks).where(inArray(flashcardDecks.classId, demoClassIds));
    const demoDeckIds = demoDecks.map((d) => d.id);
    if (demoDeckIds.length > 0) {
      const demoCards = await db.select({ id: flashcardCards.id }).from(flashcardCards).where(inArray(flashcardCards.deckId, demoDeckIds));
      const demoCardIds = demoCards.map((c) => c.id);
      if (demoCardIds.length > 0) {
        await db.delete(flashcardStudyEvents).where(inArray(flashcardStudyEvents.cardId, demoCardIds));
        await db.delete(flashcardSaves).where(inArray(flashcardSaves.cardId, demoCardIds));
      }
      await db.delete(flashcardCards).where(inArray(flashcardCards.deckId, demoDeckIds));
      await db.delete(flashcardDecks).where(inArray(flashcardDecks.id, demoDeckIds));
    }

    // Attendance: classSessions for demo classes
    const demoSessions = await db.select({ id: classSessions.id }).from(classSessions).where(inArray(classSessions.classId, demoClassIds));
    const demoSessionIds = demoSessions.map((s) => s.id);
    if (demoSessionIds.length > 0) {
      await db.delete(attendanceRecords).where(inArray(attendanceRecords.sessionId, demoSessionIds));
    }
    await db.delete(classSessions).where(inArray(classSessions.classId, demoClassIds));

    await db.delete(classroomPosts).where(inArray(classroomPosts.classId, demoClassIds));
    await db.delete(eduSessions).where(inArray(eduSessions.classId, demoClassIds));
    await db.delete(eduEnrollments).where(inArray(eduEnrollments.classId, demoClassIds));
    await db.delete(eduClassTeachers).where(inArray(eduClassTeachers.classId, demoClassIds));

    // Flashcard data created by demo users but not tied to demo classes (global decks etc.)
    const userDecks = await db.select({ id: flashcardDecks.id }).from(flashcardDecks).where(inArray(flashcardDecks.createdByUserId, demoUserIds));
    const userDeckIds = userDecks.map((d) => d.id);
    if (userDeckIds.length > 0) {
      const userCards = await db.select({ id: flashcardCards.id }).from(flashcardCards).where(inArray(flashcardCards.deckId, userDeckIds));
      const userCardIds = userCards.map((c) => c.id);
      if (userCardIds.length > 0) {
        await db.delete(flashcardStudyEvents).where(inArray(flashcardStudyEvents.cardId, userCardIds));
        await db.delete(flashcardSaves).where(inArray(flashcardSaves.cardId, userCardIds));
      }
      await db.delete(flashcardCards).where(inArray(flashcardCards.deckId, userDeckIds));
      await db.delete(flashcardDecks).where(inArray(flashcardDecks.id, userDeckIds));
    }

    // Homework submissions by demo users (in case any leftover)
    await db.delete(homeworkSubmissions).where(inArray(homeworkSubmissions.studentUserId, demoUserIds));

    // Flashcard study events and saves by demo users
    await db.delete(flashcardStudyEvents).where(inArray(flashcardStudyEvents.studentUserId, demoUserIds));
    await db.delete(flashcardSaves).where(inArray(flashcardSaves.studentUserId, demoUserIds));

    // Attendance records for demo users
    await db.delete(attendanceRecords).where(inArray(attendanceRecords.studentUserId, demoUserIds));

    await db.delete(eduClasses).where(inArray(eduClasses.id, demoClassIds));
  }

  // Clean up user-scoped demo data (in case of partial seed or mixed data)
  await db.delete(homeworkSubmissions).where(inArray(homeworkSubmissions.studentUserId, demoUserIds));
  await db.delete(flashcardStudyEvents).where(inArray(flashcardStudyEvents.studentUserId, demoUserIds));
  await db.delete(flashcardSaves).where(inArray(flashcardSaves.studentUserId, demoUserIds));
  await db.delete(attendanceRecords).where(inArray(attendanceRecords.studentUserId, demoUserIds));

  await db.delete(users).where(like(users.email, DEMO_EMAIL_PATTERN));

  console.log('Demo data cleared.');
}

main()
  .catch((err) => {
    console.error('Clear demo failed:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
