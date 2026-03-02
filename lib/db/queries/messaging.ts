import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  conversationMembers,
  conversations,
  eduClassTeachers,
  eduEnrollments,
  messages,
  users,
} from '../schema';
import { canMessage } from '@/lib/auth/messaging';

export { canMessage };
import {
  getStudentsForTeacher,
  getUserById,
  listTeachersForAdmin,
} from './education';
import { createNotification } from './notifications';
import type { PlatformRole } from '../schema';

/** Recipients the user can start a conversation with (for start-conversation UI). */
export async function getMessageableRecipients(
  userId: number,
  role: PlatformRole
): Promise<Array<{ id: number; name: string | null; email: string }>> {
  if (role === 'admin') {
    const [teachers, schoolAdmins, students] = await Promise.all([
      listTeachersForAdmin(),
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(
          and(
            eq(users.platformRole, 'school_admin'),
            isNull(users.deletedAt)
          )
        )
        .orderBy(users.name),
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(
          and(
            eq(users.platformRole, 'student'),
            isNull(users.deletedAt),
            isNull(users.archivedAt)
          )
        )
        .orderBy(users.name),
    ]);
    const seen = new Set<number>();
    const result: Array<{ id: number; name: string | null; email: string }> = [];
    for (const u of [...teachers, ...schoolAdmins, ...students]) {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        result.push({ id: u.id, name: u.name, email: u.email });
      }
    }
    return result.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
  }

  if (role === 'school_admin') {
    const currentUser = await getUserById(userId);
    const schoolId = currentUser?.schoolId ?? null;
    const [admins, studentsInSchool] = await Promise.all([
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(
          and(eq(users.platformRole, 'admin'), isNull(users.deletedAt))
        )
        .orderBy(users.name),
      schoolId
        ? db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .where(
              and(
                eq(users.platformRole, 'student'),
                eq(users.schoolId, schoolId),
                isNull(users.deletedAt),
                isNull(users.archivedAt)
              )
            )
            .orderBy(users.name)
        : Promise.resolve([]),
    ]);
    const seen = new Set<number>();
    const result: Array<{ id: number; name: string | null; email: string }> = [];
    for (const u of [...admins, ...studentsInSchool]) {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        result.push({ id: u.id, name: u.name, email: u.email });
      }
    }
    return result.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
  }

  if (role === 'teacher') {
    const [studentRows, admins] = await Promise.all([
      getStudentsForTeacher(userId),
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(
          and(eq(users.platformRole, 'admin'), isNull(users.deletedAt))
        )
        .orderBy(users.name),
    ]);
    const seen = new Set<number>();
    const result: Array<{ id: number; name: string | null; email: string }> = [];
    for (const r of studentRows) {
      if (!seen.has(r.studentId)) {
        seen.add(r.studentId);
        result.push({
          id: r.studentId,
          name: r.studentName,
          email: r.studentEmail,
        });
      }
    }
    for (const a of admins) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        result.push({ id: a.id, name: a.name, email: a.email });
      }
    }
    return result.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
  }

  if (role === 'student') {
    const [teacherRows, admins] = await Promise.all([
      db
        .selectDistinct({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(eduEnrollments)
        .innerJoin(eduClassTeachers, eq(eduClassTeachers.classId, eduEnrollments.classId))
        .innerJoin(users, eq(eduClassTeachers.teacherUserId, users.id))
        .where(
          and(
            eq(eduEnrollments.studentUserId, userId),
            eq(eduEnrollments.status, 'active'),
            isNull(users.deletedAt)
          )
        )
        .orderBy(users.name),
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(
          and(eq(users.platformRole, 'admin'), isNull(users.deletedAt))
        )
        .orderBy(users.name),
    ]);
    const seen = new Set<number>();
    const result: Array<{ id: number; name: string | null; email: string }> = [];
    for (const u of [...teacherRows, ...admins]) {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        result.push({ id: u.id, name: u.name, email: u.email });
      }
    }
    return result.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
  }

  return [];
}

/** List conversations where user is a member, with last message preview and other member name. */
export async function listConversationsForUser(userId: number) {
  const myConvoIds = await db
    .select({ conversationId: conversationMembers.conversationId })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, userId));

  if (myConvoIds.length === 0) return [];

  // For each conversation: get other member and last message
  const results: Array<{
    id: string;
    otherUser: { id: number; name: string | null; email: string };
    lastMessage: { body: string; createdAt: Date } | null;
    createdAt: Date;
  }> = [];

  for (const row of myConvoIds) {
    const cid = row.conversationId;
    const [conv, members, lastMsg] = await Promise.all([
      db.select().from(conversations).where(eq(conversations.id, cid)).limit(1),
      db
        .select({
          userId: conversationMembers.userId,
          name: users.name,
          email: users.email,
        })
        .from(conversationMembers)
        .innerJoin(users, eq(conversationMembers.userId, users.id))
        .where(eq(conversationMembers.conversationId, cid)),
      db
        .select({ body: messages.body, createdAt: messages.createdAt })
        .from(messages)
        .where(eq(messages.conversationId, cid))
        .orderBy(desc(messages.createdAt))
        .limit(1),
    ]);

    const convo = conv[0];
    if (!convo) continue;

    const other = members.find((m) => m.userId !== userId);
    if (!other) continue;

    results.push({
      id: cid,
      otherUser: { id: other.userId, name: other.name, email: other.email },
      lastMessage: lastMsg[0] ?? null,
      createdAt: convo.createdAt,
    });
  }

  // Sort by last message or createdAt
  results.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? a.createdAt;
    const bTime = b.lastMessage?.createdAt ?? b.createdAt;
    return bTime.getTime() - aTime.getTime();
  });

  return results;
}

/** Get thread for a conversation; returns null if user is not a member. */
export async function getConversationThread(conversationId: string, userId: number) {
  const memberCheck = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, userId)
      )
    )
    .limit(1);

  if (memberCheck.length === 0) return null;

  const [conv, msgs, members] = await Promise.all([
    db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1),
    db
      .select({
        id: messages.id,
        body: messages.body,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt),
    db
      .select({
        userId: conversationMembers.userId,
        name: users.name,
        email: users.email,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(eq(conversationMembers.conversationId, conversationId)),
  ]);

  const convo = conv[0];
  if (!convo) return null;

  const other = members.find((m) => m.userId !== userId);

  return {
    conversation: convo,
    messages: msgs,
    otherUser: other ? { id: other.userId, name: other.name, email: other.email } : null,
  };
}

/** Find existing DM between two users, or null. */
export async function findExistingConversation(
  userId1: number,
  userId2: number
): Promise<string | null> {
  const convos1 = await db
    .select({ conversationId: conversationMembers.conversationId })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, userId1));

  if (convos1.length === 0) return null;

  const ids = convos1.map((r) => r.conversationId);
  for (const cid of ids) {
    const hasBoth = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, cid),
          eq(conversationMembers.userId, userId2)
        )
      )
      .limit(1);
    if (hasBoth.length > 0) return cid;
  }
  return null;
}

/** Start a conversation; returns existing if one exists, else creates after canMessage check. */
export async function startConversation(
  senderId: number,
  recipientId: number
): Promise<{ success: true; conversationId: string } | { success: false; error: string }> {
  const allowed = await canMessage(senderId, recipientId);
  if (!allowed) {
    return { success: false, error: 'You cannot message this user.' };
  }

  const existing = await findExistingConversation(senderId, recipientId);
  if (existing) {
    return { success: true, conversationId: existing };
  }

  const [created] = await db
    .insert(conversations)
    .values({ type: 'dm' })
    .returning({ id: conversations.id });

  if (!created) {
    return { success: false, error: 'Failed to create conversation.' };
  }

  await db.insert(conversationMembers).values([
    { conversationId: created.id, userId: senderId },
    { conversationId: created.id, userId: recipientId },
  ]);

  return { success: true, conversationId: created.id };
}

/** Send a message; requires membership. */
export async function sendMessage(
  conversationId: string,
  senderId: number,
  body: string
): Promise<{ success: true; messageId: string } | { success: false; error: string }> {
  const memberCheck = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, senderId)
      )
    )
    .limit(1);

  if (memberCheck.length === 0) {
    return { success: false, error: 'You are not a member of this conversation.' };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId,
      body: trimmed,
    })
    .returning({ id: messages.id });

  if (!msg) {
    return { success: false, error: 'Failed to send message.' };
  }

  // Create notification for recipient
  const members = await db
    .select({ userId: conversationMembers.userId })
    .from(conversationMembers)
    .where(eq(conversationMembers.conversationId, conversationId));
  const recipient = members.find((m) => m.userId !== senderId);
  if (recipient) {
    const sender = await getUserById(senderId);
    const senderName = sender?.name ?? sender?.email ?? 'Someone';
    const preview = trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed;
    await createNotification({
      userId: recipient.userId,
      type: 'message',
      title: `New message from ${senderName}`,
      body: preview,
      href: `/dashboard/messages?c=${conversationId}`,
      sourceType: 'message',
      sourceId: conversationId,
    });
  }

  return { success: true, messageId: msg.id };
}
