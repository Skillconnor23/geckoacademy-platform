/**
 * Demo seed script for marketing/demo environments only.
 * Creates realistic demo accounts and content for all roles.
 *
 * Usage: DEMO_SEED=true pnpm run seed:demo
 * Safety: Blocked in NODE_ENV=production unless DEMO_SEED=true explicitly.
 */

import 'dotenv/config';
import { hash } from 'bcryptjs';
import { db } from '../lib/db/drizzle';
import { like, inArray, eq } from 'drizzle-orm';
import {
  users,
  eduClasses,
  classroomPosts,
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
  eduQuizzes,
  eduQuizClasses,
  eduQuizQuestions,
  eduQuizSubmissions,
  eduReadings,
  eduReadingCompletions,
} from '../lib/db/schema';

// Must match lib/auth/session.ts: SALT_ROUNDS = 10 and bcrypt.compare for login
const SALT_ROUNDS = 10;

const DEMO_PASSWORD = 'DemoPass123!';
const DEMO_EMAIL_PATTERN = '%@demo.com';

// Safety gate: never run in production unless explicitly opted in
function assertSafeToSeed() {
  const isProd = process.env.NODE_ENV === 'production';
  const demoSeed = process.env.DEMO_SEED === 'true' || process.env.DEMO_SEED === '1';
  if (isProd && !demoSeed) {
    throw new Error(
      'Demo seed is blocked in production. Set DEMO_SEED=true to override (use with caution).'
    );
  }
  if (!demoSeed) {
    console.warn(
      'Set DEMO_SEED=true to confirm. Demo seed creates @demo.com users and demo content.'
    );
    throw new Error('Set DEMO_SEED=true to run the demo seed.');
  }
}

// Deterministic join codes
const JOIN_CODES = ['BEGIN-A1', 'BEGIN-B2', 'INT-A3', 'INT-B4', 'BEGIN-C5'] as const;
const SCHOOL_UBIS = 'demo-school-ubis';
const SCHOOL_ERDENET = 'demo-school-erdenet';

// Student names (Mongolian-inspired, realistic)
const STUDENT_NAMES = [
  'Bat-Erdene Jargal',
  'Nomin Gerel',
  'Bold Otgonbayar',
  'Enkhbayar Saruul',
  'Tuguldur Altantsetseg',
  'Munkhbat Oyunchimeg',
  'Erdenechimeg Baasandorj',
  'Batmunkh Dorjsuren',
  'Lkhagvasuren Anu',
  'Gantulga Nomin-Erdene',
  'Chuluunbaatar Dulguun',
  'Tumurbaatar Odonchimeg',
  'Saran Delgermaa',
  'Tsend Batbayar',
  'Batsaikhan Orkhon',
  'Oyuntsetseg Naran',
  'Sukhbat Bolormaa',
  'Uuganbaatar Enkhtuul',
  'Tsogtbileg Ariunaa',
  'Narmandakh Bilegt',
  'Mendsaikhan Zolzaya',
  'Tuvshinjargal Uurtsaikh',
  'Enkhjargal Bataa',
  'Chinggis Narantuya',
];

// Emergency Vocabulary (word, definition, example) - 16 cards
const EMERGENCY_VOCAB: { word: string; definition: string; example: string }[] = [
  { word: 'Help', definition: 'Assistance or support', example: 'Help! I need a doctor.' },
  { word: 'Emergency', definition: 'A serious, urgent situation', example: 'This is an emergency.' },
  { word: 'Fire', definition: 'Burning with flames', example: 'There is a fire in the building.' },
  { word: 'Ambulance', definition: 'Vehicle for medical emergencies', example: 'Call an ambulance!' },
  { word: 'Police', definition: 'Law enforcement officers', example: 'I need to call the police.' },
  { word: 'Hospital', definition: 'Place for medical treatment', example: 'Take me to the hospital.' },
  { word: 'Doctor', definition: 'Medical professional', example: 'I need to see a doctor.' },
  { word: 'Pain', definition: 'Physical discomfort', example: 'I have pain in my chest.' },
  { word: 'Danger', definition: 'Risk of harm', example: 'Stay away, it is dangerous.' },
  { word: 'Safe', definition: 'Free from harm', example: 'We are safe now.' },
  { word: 'Exit', definition: 'Way out', example: 'Where is the exit?' },
  { word: 'Accident', definition: 'Unexpected harmful event', example: 'There was an accident.' },
  { word: 'Injured', definition: 'Hurt or wounded', example: 'Someone is injured.' },
  { word: 'Medicine', definition: 'Treatment for illness', example: 'I need my medicine.' },
  { word: 'Allergy', definition: 'Body reaction to substance', example: 'I have a nut allergy.' },
  { word: 'Bleeding', definition: 'Losing blood', example: 'The wound is bleeding.' },
];

// Daily Life vocab - 16 cards
const DAILY_LIFE_VOCAB: { word: string; definition: string; example: string }[] = [
  { word: 'Hello', definition: 'Greeting', example: 'Hello! How are you?' },
  { word: 'Thank you', definition: 'Expression of gratitude', example: 'Thank you for your help.' },
  { word: 'Please', definition: 'Polite request', example: 'Please pass the salt.' },
  { word: 'Sorry', definition: 'Apology', example: 'I am sorry for being late.' },
  { word: 'Water', definition: 'H2O, drinking liquid', example: 'Can I have some water?' },
  { word: 'Food', definition: 'Something to eat', example: 'I need food.' },
  { word: 'Bathroom', definition: 'Toilet, restroom', example: 'Where is the bathroom?' },
  { word: 'Money', definition: 'Currency for payment', example: 'I need to change money.' },
  { word: 'Bus', definition: 'Public transport vehicle', example: 'Does this bus go to the city?' },
  { word: 'Taxi', definition: 'Hired car', example: 'I need a taxi.' },
  { word: 'Hotel', definition: 'Place to stay', example: 'I have a reservation at the hotel.' },
  { word: 'Phone', definition: 'Communication device', example: 'Can I use your phone?' },
  { word: 'Shop', definition: 'Store to buy things', example: 'Where is the nearest shop?' },
  { word: 'Price', definition: 'Cost of something', example: 'What is the price?' },
  { word: 'Open', definition: 'Not closed', example: 'Is the bank open?' },
  { word: 'Closed', definition: 'Not open', example: 'The store is closed today.' },
];

// School & Study vocab - 16 cards
const SCHOOL_VOCAB: { word: string; definition: string; example: string }[] = [
  { word: 'Class', definition: 'Lesson or course', example: 'What time is our class?' },
  { word: 'Homework', definition: 'Work to do at home', example: 'I finished my homework.' },
  { word: 'Teacher', definition: 'Person who teaches', example: 'Our teacher is very kind.' },
  { word: 'Student', definition: 'Person who learns', example: 'I am a student.' },
  { word: 'Book', definition: 'Written work to read', example: 'I need my book.' },
  { word: 'Pen', definition: 'Writing tool', example: 'Can I borrow a pen?' },
  { word: 'Paper', definition: 'Material for writing', example: 'I need paper for the test.' },
  { word: 'Test', definition: 'Exam or assessment', example: 'We have a test tomorrow.' },
  { word: 'Question', definition: 'Something to ask', example: 'I have a question.' },
  { word: 'Answer', definition: 'Response to a question', example: 'What is the answer?' },
  { word: 'Understand', definition: 'To comprehend', example: 'I do not understand.' },
  { word: 'Read', definition: 'To look at and comprehend text', example: 'Please read the paragraph.' },
  { word: 'Write', definition: 'To form letters/words', example: 'Write your name here.' },
  { word: 'Learn', definition: 'To gain knowledge', example: 'I want to learn English.' },
  { word: 'Practice', definition: 'Repeated exercise', example: 'I need to practice more.' },
  { word: 'Grade', definition: 'Score or mark', example: 'What grade did you get?' },
];

const MODULE_VOCABS = [
  { title: 'Emergency Vocabulary', description: 'Essential words for emergencies', vocab: EMERGENCY_VOCAB },
  { title: 'Daily Life', description: 'Common words for everyday situations', vocab: DAILY_LIFE_VOCAB },
  { title: 'School & Study', description: 'Vocabulary for the classroom', vocab: SCHOOL_VOCAB },
];

function makeDate(daysFromNow: number, hour: number, min: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, min, 0, 0);
  return d;
}

/** Clear existing demo data to make seed idempotent. */
async function clearExistingDemo() {
  const demoUsers = await db.select({ id: users.id }).from(users).where(like(users.email, DEMO_EMAIL_PATTERN));
  const demoUserIds = demoUsers.map((u) => u.id);
  if (demoUserIds.length === 0) return;

  const teacherClassRows = await db
    .selectDistinct({ classId: eduClassTeachers.classId })
    .from(eduClassTeachers)
    .where(inArray(eduClassTeachers.teacherUserId, demoUserIds));
  const studentClassRows = await db
    .selectDistinct({ classId: eduEnrollments.classId })
    .from(eduEnrollments)
    .where(inArray(eduEnrollments.studentUserId, demoUserIds));
  const demoClassIds = [...new Set([...teacherClassRows.map((r) => r.classId), ...studentClassRows.map((r) => r.classId)])];

  if (demoClassIds.length > 0) {
    const demoHw = await db.select({ id: homework.id }).from(homework).where(inArray(homework.classId, demoClassIds));
    const demoHwIds = demoHw.map((h) => h.id);
    if (demoHwIds.length > 0) await db.delete(homeworkSubmissions).where(inArray(homeworkSubmissions.homeworkId, demoHwIds));
    await db.delete(homework).where(inArray(homework.classId, demoClassIds));

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

    const demoSessions = await db.select({ id: classSessions.id }).from(classSessions).where(inArray(classSessions.classId, demoClassIds));
    const demoSessionIds = demoSessions.map((s) => s.id);
    if (demoSessionIds.length > 0) await db.delete(attendanceRecords).where(inArray(attendanceRecords.sessionId, demoSessionIds));
    await db.delete(classSessions).where(inArray(classSessions.classId, demoClassIds));
    await db.delete(classroomPosts).where(inArray(classroomPosts.classId, demoClassIds));
    await db.delete(eduSessions).where(inArray(eduSessions.classId, demoClassIds));
    await db.delete(eduEnrollments).where(inArray(eduEnrollments.classId, demoClassIds));
    await db.delete(eduClassTeachers).where(inArray(eduClassTeachers.classId, demoClassIds));

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
    const demoReadings = await db.select({ id: eduReadings.id }).from(eduReadings).where(inArray(eduReadings.classId, demoClassIds));
    const demoReadingIds = demoReadings.map((r) => r.id);
    if (demoReadingIds.length > 0) await db.delete(eduReadingCompletions).where(inArray(eduReadingCompletions.readingId, demoReadingIds));
    await db.delete(eduReadings).where(inArray(eduReadings.classId, demoClassIds));

    await db.delete(homeworkSubmissions).where(inArray(homeworkSubmissions.studentUserId, demoUserIds));
    await db.delete(flashcardStudyEvents).where(inArray(flashcardStudyEvents.studentUserId, demoUserIds));
    await db.delete(flashcardSaves).where(inArray(flashcardSaves.studentUserId, demoUserIds));
    await db.delete(attendanceRecords).where(inArray(attendanceRecords.studentUserId, demoUserIds));
    await db.delete(eduClasses).where(inArray(eduClasses.id, demoClassIds));
  }
  await db.delete(users).where(like(users.email, DEMO_EMAIL_PATTERN));
}

async function main() {
  assertSafeToSeed();

  console.log('Clearing existing demo data (idempotent)...');
  await clearExistingDemo();

  const passwordHash = await hash(DEMO_PASSWORD, SALT_ROUNDS);

  console.log('Creating demo users...');
  const userEmails = [
    'geckoadmin@demo.com',
    'admin.ubis@demo.com',
    'admin.erdenet@demo.com',
    't.azzaya@demo.com',
    't.bolormaa@demo.com',
    't.andy@demo.com',
    't.sarah@demo.com',
    't.connor@demo.com',
    ...Array.from({ length: 24 }, (_, i) => `student${String(i + 1).padStart(2, '0')}@demo.com`),
  ];

  const insertedUsers = await db
    .insert(users)
    .values(
      userEmails.map((email, i) => {
        let name: string;
        let platformRole: string;
        let schoolId: string | null = null;
        if (i === 0) {
          name = 'Gecko Admin';
          platformRole = 'admin';
        } else if (i === 1) {
          name = 'UBIS School Admin';
          platformRole = 'school_admin';
          schoolId = SCHOOL_UBIS;
        } else if (i === 2) {
          name = 'Erdenet School Admin';
          platformRole = 'school_admin';
          schoolId = SCHOOL_ERDENET;
        } else if (i >= 3 && i <= 7) {
          name = ['Azzaya B.', 'Bolormaa D.', 'Andy K.', 'Sarah L.', 'Connor'][i - 3];
          platformRole = 'teacher';
        } else {
          name = STUDENT_NAMES[i - 8];
          platformRole = 'student';
          schoolId = i - 8 < 12 ? SCHOOL_UBIS : SCHOOL_ERDENET;
        }
        return {
          email,
          passwordHash,
          name,
          platformRole,
          schoolId,
          deletedAt: null,
          emailVerified: new Date(), // Demo users: treat as verified so login works
        };
      })
    )
    .returning();

  const userByEmail = new Map(insertedUsers.map((u) => [u.email, u]));
  const geckoAdmin = userByEmail.get('geckoadmin@demo.com')!;
  const schoolAdmins = [userByEmail.get('admin.ubis@demo.com')!, userByEmail.get('admin.erdenet@demo.com')!];
  const teachers = [
    userByEmail.get('t.azzaya@demo.com')!,
    userByEmail.get('t.bolormaa@demo.com')!,
    userByEmail.get('t.andy@demo.com')!,
    userByEmail.get('t.sarah@demo.com')!,
    userByEmail.get('t.connor@demo.com')!,
  ];
  const studentUsers = insertedUsers.filter((u) => u.platformRole === 'student');
  const student01 = studentUsers[0]!;

  console.log('Creating demo classes...');
  const classSpecs = [
    { name: 'Beginner A (Sat)', level: 'Beginner', scheduleDays: ['sat'], joinCode: JOIN_CODES[0], teacherIdx: 0 },
    { name: 'Beginner B (Sun)', level: 'Beginner', scheduleDays: ['sun'], joinCode: JOIN_CODES[1], teacherIdx: 1 },
    { name: 'Intermediate A (Sat)', level: 'Intermediate', scheduleDays: ['sat'], joinCode: JOIN_CODES[2], teacherIdx: 2 },
    { name: 'Intermediate B (Sun)', level: 'Intermediate', scheduleDays: ['sun'], joinCode: JOIN_CODES[3], teacherIdx: 3 },
    { name: 'Beginner Class B', level: 'Beginner', scheduleDays: ['sun'], joinCode: JOIN_CODES[4], teacherIdx: 4 },
  ];

  const insertedClasses = await db
    .insert(eduClasses)
    .values(
      classSpecs.map((c) => ({
        name: c.name,
        description: `Demo ${c.level} class - ${c.scheduleDays[0].toUpperCase()} schedule`,
        level: c.level,
        timezone: 'Asia/Ulaanbaatar',
        joinCode: c.joinCode,
        joinCodeEnabled: true,
        scheduleDays: c.scheduleDays,
        scheduleStartTime: '10:00',
        scheduleTimezone: 'Asia/Ulaanbaatar',
        scheduleStartDate: new Date().toISOString().slice(0, 10),
        durationMinutes: 50,
      }))
    )
    .returning();

  for (let i = 0; i < insertedClasses.length; i++) {
    await db.insert(eduClassTeachers).values({
      classId: insertedClasses[i].id,
      teacherUserId: teachers[classSpecs[i].teacherIdx].id,
    });
  }

  // Enroll 6 students per class (class 0: students 1-5 only; class 4: student01 only for demo dashboard)
  for (let c = 0; c < 4; c++) {
    const start = c * 6;
    for (let s = 0; s < 6; s++) {
      if (c === 0 && s === 0) continue; // student01 only in Beginner Class B
      await db.insert(eduEnrollments).values({
        classId: insertedClasses[c].id,
        studentUserId: studentUsers[start + s].id,
        status: 'active',
      });
    }
  }
  await db.insert(eduEnrollments).values({
    classId: insertedClasses[4].id,
    studentUserId: student01.id,
    status: 'active',
  });

  // This week's Monday (ISO) for "This week" readings
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = today.getDate() - day + (day === 0 ? -6 : 1);
  const thisWeekMonday = new Date(today);
  thisWeekMonday.setDate(mondayOffset);
  const weekOfStr = thisWeekMonday.toISOString().slice(0, 10);

  console.log('Creating demo readings...');
  const firstClassId = insertedClasses[0].id;
  const beginnerClassBId = insertedClasses[4].id;
  await db.insert(eduReadings).values([
    {
      classId: firstClassId,
      title: 'Emergency Vocabulary Practice',
      description: 'Short reading to practice emergency-related words.',
      content: `When you travel or live in a new place, it is important to know some emergency words.

If you need help, say "Help!" or "Emergency!"

You can call the police or an ambulance. If there is a fire, find the exit and leave the building.

If you feel pain or are injured, go to the hospital or see a doctor. Tell them if you have an allergy.

Stay safe.`,
      weekOf: weekOfStr,
      vocab: ['emergency', 'ambulance', 'hospital', 'exit', 'allergy'],
      questions: ['What should you say if you need help?', 'Where do you go if you are injured?'],
    },
    {
      classId: firstClassId,
      title: 'Daily Greetings',
      description: 'Practice saying hello and thank you.',
      content: `Hello! How are you?

In English we say "Thank you" when someone helps us. We say "Please" when we ask for something.

If we are late, we say "Sorry."

Can I have some water? Where is the bathroom?`,
      weekOf: weekOfStr,
      vocab: ['Hello', 'Thank you', 'Please', 'Sorry', 'Bathroom'],
      questions: [],
    },
    {
      classId: beginnerClassBId,
      title: 'Welcome to Beginner Class B',
      description: 'Your first reading assignment.',
      content: `Welcome to the class!

This is your first reading. Read it carefully.

Practice the vocabulary words at the end. You can mark this as complete when you finish.`,
      weekOf: weekOfStr,
      vocab: ['welcome', 'reading', 'vocabulary', 'practice'],
      questions: ['What is this reading about?'],
    },
  ]);

  console.log('Creating flashcards (modules + cards + study events)...');
  for (let c = 0; c < 4; c++) {
    const teacher = teachers[classSpecs[c].teacherIdx];
    const classStudents = c === 0 ? studentUsers.slice(1, 6) : studentUsers.slice(c * 6, c * 6 + 6);
    for (const mod of MODULE_VOCABS) {
      const [deck] = await db
        .insert(flashcardDecks)
        .values({
          title: mod.title,
          description: mod.description,
          createdByUserId: teacher.id,
          scope: 'class',
          classId: insertedClasses[c].id,
          isPublished: true,
        })
        .returning();

      const studyEventRows: { studentUserId: number; deckId: string; cardId: string; result: 'correct' | 'incorrect'; studiedAt: Date }[] = [];
      for (let i = 0; i < mod.vocab.length; i++) {
        const [card] = await db
          .insert(flashcardCards)
          .values({
            deckId: deck.id,
            front: mod.vocab[i].word,
            back: mod.vocab[i].definition,
            example: mod.vocab[i].example,
            sortOrder: i + 1,
          })
          .returning();
        if (!card) continue;

        for (const student of classStudents) {
          for (let e = 0; e < 2; e++) {
            const result = (student.id + i + e) % 3 !== 0 ? 'correct' : 'incorrect';
            studyEventRows.push({
              studentUserId: student.id,
              deckId: deck.id,
              cardId: card.id,
              result: result as 'correct' | 'incorrect',
              studiedAt: makeDate(-e - 1, 9 + (e % 3), e * 7),
            });
          }
        }
      }
      if (studyEventRows.length > 0) {
        await db.insert(flashcardStudyEvents).values(studyEventRows);
      }
    }
  }

  console.log('Creating homework and submissions...');
  const homeworkTitles = [
    'Vocabulary Practice: Emergency Words',
    'Daily Life Dialogues',
    'School Words Quiz',
    'Writing Assignment: My Week',
  ];
  const homeworkInstructions = [
    'Practice the emergency vocabulary words. Write 5 sentences using at least 3 words.',
    'Create a short dialogue using daily life vocabulary. Record yourself reading it.',
    'Complete the school vocabulary quiz and submit your answers.',
    'Write a short paragraph about your week using at least 10 vocabulary words.',
  ];

  for (let c = 0; c < 4; c++) {
    const teacher = teachers[classSpecs[c].teacherIdx];
    const classStudents = c === 0 ? studentUsers.slice(1, 6) : studentUsers.slice(c * 6, c * 6 + 6);
    for (let h = 0; h < 4; h++) {
      const [hw] = await db
        .insert(homework)
        .values({
          classId: insertedClasses[c].id,
          title: homeworkTitles[h],
          instructions: homeworkInstructions[h],
          dueDate: makeDate(7 + h * 3, 23, 59),
          createdByUserId: teacher.id,
        })
        .returning();

      // ~50% of students submit
      const submitCount = Math.ceil(classStudents.length * 0.5);
      const submitters = classStudents.slice(0, submitCount);
      for (const student of submitters) {
        await db.insert(homeworkSubmissions).values({
          homeworkId: hw.id,
          studentUserId: student.id,
          textNote: `Demo submission from ${student.name}. I completed the assignment.`,
          files: [
            { url: '/demo/uploads/sample1.png', mimeType: 'image/png', name: 'sample1.png', size: 68 },
            { url: '/demo/uploads/sample-audio.m4a', mimeType: 'audio/mp4', name: 'sample-audio.m4a', size: 12000 },
          ],
          submittedAt: makeDate(-h - 1, 14, 30),
        });
      }
    }
  }

  console.log('Creating sessions (eduSessions + classSessions)...');
  const RECORDING_PLACEHOLDER = 'https://demo.example.com/recordings/session-placeholder';

  for (let c = 0; c < 4; c++) {
    const classId = insertedClasses[c].id;
    for (let s = 0; s < 6; s++) {
      const daysAgo = 14 - s;
      const start = makeDate(-daysAgo, 10, 0);
      const end = makeDate(-daysAgo, 10, 50);
      const hasRecording = s === 1 || s === 3;

      await db.insert(eduSessions).values({
        classId,
        startsAt: start,
        endsAt: end,
        meetingUrl: hasRecording ? RECORDING_PLACEHOLDER : null,
        title: `Session ${s + 1}`,
      });

      const [csession] = await db
        .insert(classSessions)
        .values({
          classId,
          startsAt: start,
        })
        .returning();

      // Mark attendance for some students
      const classStudents = c === 0 ? studentUsers.slice(1, 6) : studentUsers.slice(c * 6, c * 6 + 6);
      for (let i = 0; i < classStudents.length; i++) {
        const status = i === 0 && s % 5 === 0 ? 'late' : i < 2 && s % 7 === 0 ? 'absent' : 'present';
        await db.insert(attendanceRecords).values({
          sessionId: csession.id,
          studentUserId: classStudents[i].id,
          status: status as 'present' | 'absent' | 'late',
          participationScore: status === 'present' ? 2 + (i % 2) : null,
        });
      }
    }
  }

  // --- student01@demo.com: realistic dashboard (quiz results, attendance, upcoming class, homework) ---
  const beginnerClassB = insertedClasses[4]!;
  const connor = teachers[4]!;

  // Clear any existing student01 demo data so re-runs stay consistent
  await db.delete(attendanceRecords).where(eq(attendanceRecords.studentUserId, student01.id));
  await db.delete(eduQuizSubmissions).where(eq(eduQuizSubmissions.studentUserId, student01.id));
  await db.delete(homeworkSubmissions).where(eq(homeworkSubmissions.studentUserId, student01.id));
  await db.delete(homework).where(eq(homework.classId, beginnerClassB.id));
  await db.delete(classSessions).where(eq(classSessions.classId, beginnerClassB.id));
  await db.delete(eduSessions).where(eq(eduSessions.classId, beginnerClassB.id));
  // Quizzes for Beginner Class B (quiz_classes + submissions already cleared above)
  const quizIdsForClass = await db
    .select({ quizId: eduQuizClasses.quizId })
    .from(eduQuizClasses)
    .where(eq(eduQuizClasses.classId, beginnerClassB.id));
  for (const row of quizIdsForClass) {
    await db.delete(eduQuizSubmissions).where(eq(eduQuizSubmissions.quizId, row.quizId));
    await db.delete(eduQuizQuestions).where(eq(eduQuizQuestions.quizId, row.quizId));
    await db.delete(eduQuizClasses).where(eq(eduQuizClasses.quizId, row.quizId));
    await db.delete(eduQuizzes).where(eq(eduQuizzes.id, row.quizId));
  }

  // 8 class attendance records (last 30 days): 6 present, 1 late, 1 absent
  const quizScores = [78, 82, 85, 90, 88, 91, 84, 87, 92, 89, 86, 93];
  const attendanceStatuses: Array<'present' | 'late' | 'absent'> = ['present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent'];

  for (let i = 0; i < 8; i++) {
    const daysAgo = 3 + i * 4; // spread over last ~30 days
    const start = makeDate(-daysAgo, 10, 0);
    const end = makeDate(-daysAgo, 10, 50);
    await db.insert(eduSessions).values({
      classId: beginnerClassB.id,
      startsAt: start,
      endsAt: end,
      title: `Session ${i + 1}`,
    });
    const [csession] = await db
      .insert(classSessions)
      .values({ classId: beginnerClassB.id, startsAt: start })
      .returning();
    if (csession) {
      await db.insert(attendanceRecords).values({
        sessionId: csession.id,
        studentUserId: student01.id,
        status: attendanceStatuses[i],
        participationScore: attendanceStatuses[i] === 'present' ? 2 : null,
      });
    }
  }

  // Attendance — This month: exactly 8 sessions → Present 6, Late 1, Absent 1 (clean UI numbers)
  const thisMonthStatuses: Array<'present' | 'late' | 'absent'> = ['present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent'];
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  for (let i = 0; i < 8; i++) {
    const dayOfMonth = 1 + i;
    const start = new Date(Date.UTC(y, m, dayOfMonth, 10, 0, 0));
    const end = new Date(start.getTime() + 50 * 60 * 1000);
    if (start > now) continue; // only include sessions that have "happened" so monthly query counts them
    await db.insert(eduSessions).values({
      classId: beginnerClassB.id,
      startsAt: start,
      endsAt: end,
      title: `This month session ${dayOfMonth}`,
    });
    const [csession] = await db
      .insert(classSessions)
      .values({ classId: beginnerClassB.id, startsAt: start })
      .returning();
    if (csession) {
      await db.insert(attendanceRecords).values({
        sessionId: csession.id,
        studentUserId: student01.id,
        status: thisMonthStatuses[i]!,
        participationScore: thisMonthStatuses[i] === 'present' ? 2 : null,
      });
    }
  }

  // 1 upcoming session 2 days from now: Beginner Class B, 50 min, Teacher Connor
  const inTwoDays = makeDate(2, 10, 0);
  const inTwoDaysEnd = makeDate(2, 10, 50);
  await db.insert(eduSessions).values({
    classId: beginnerClassB.id,
    startsAt: inTwoDays,
    endsAt: inTwoDaysEnd,
    title: 'Beginner Class B',
    meetingUrl: 'https://meet.example.com/beginner-b',
  });

  // 12 quiz results over last 30 days (scores 78–93)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  for (let q = 0; q < 12; q++) {
    const [quiz] = await db
      .insert(eduQuizzes)
      .values({
        title: `Unit ${q + 1} Quiz`,
        description: 'Demo quiz',
        createdByUserId: connor.id,
        status: 'PUBLISHED',
        publishedAt: thirtyDaysAgo,
      })
      .returning();
    if (!quiz) continue;
    await db.insert(eduQuizClasses).values({ quizId: quiz.id, classId: beginnerClassB.id });
    await db.insert(eduQuizQuestions).values({
      quizId: quiz.id,
      type: 'MCQ',
      prompt: 'Sample question',
      correctAnswer: ['A'],
      order: 0,
    });
    const submittedAt = new Date(thirtyDaysAgo.getTime() + (q * 2.2) * 24 * 60 * 60 * 1000);
    await db.insert(eduQuizSubmissions).values({
      quizId: quiz.id,
      studentUserId: student01.id,
      score: quizScores[q]!,
      submittedAt,
      answers: [{ questionIndex: 0, answer: 'A' }],
    });
  }

  // 10 homework: 8 completed, 2 incomplete
  const hwTitles = [
    'Vocabulary Unit 1', 'Reading Practice', 'Grammar Exercise', 'Writing Task 1',
    'Listening Practice', 'Vocabulary Unit 2', 'Speaking Prep', 'Writing Task 2',
    'Review Homework', 'Extra Practice',
  ];
  for (let h = 0; h < 10; h++) {
    const [hw] = await db
      .insert(homework)
      .values({
        classId: beginnerClassB.id,
        title: hwTitles[h] ?? `Homework ${h + 1}`,
        instructions: 'Complete and submit.',
        dueDate: makeDate(7 + h, 23, 59),
        createdByUserId: connor.id,
      })
      .returning();
    if (hw && h < 8) {
      await db.insert(homeworkSubmissions).values({
        homeworkId: hw.id,
        studentUserId: student01.id,
        textNote: 'Submitted.',
        submittedAt: makeDate(-(8 - h), 14, 30),
      });
    }
  }

  console.log('\n--- Demo seed complete ---');
  console.log('Login with any demo account using password: DemoPass123!');
  console.log('\nDemo accounts:');
  console.log('  Gecko Admin:     geckoadmin@demo.com');
  console.log('  School Admins:   admin.ubis@demo.com, admin.erdenet@demo.com');
  console.log('  Teachers:        t.azzaya@demo.com, t.bolormaa@demo.com, t.andy@demo.com, t.sarah@demo.com, t.connor@demo.com');
  console.log('  Students:        student01@demo.com ... student24@demo.com');
  console.log('  Student dashboard (realistic): student01@demo.com (12 quizzes, 8 attendance, 1 upcoming, 10 homework)');
  console.log('\nClass join codes: BEGIN-A1, BEGIN-B2, INT-A3, INT-B4, BEGIN-C5');
}

main()
  .catch((err) => {
    console.error('Demo seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
