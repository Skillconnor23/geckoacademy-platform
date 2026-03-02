import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import { notifications } from '../schema';

export type CreateNotificationData = {
  userId: number;
  type: string;
  title: string;
  body?: string | null;
  href: string;
  sourceType?: string | null;
  sourceId?: string | null;
};

/** Create a notification for a user. */
export async function createNotification(data: CreateNotificationData) {
  const [created] = await db
    .insert(notifications)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body ?? null,
      href: data.href,
      sourceType: data.sourceType ?? null,
      sourceId: data.sourceId ?? null,
    })
    .returning();
  return created;
}

/** Get notifications for user, newest first. */
export async function getNotifications(userId: number, limit = 20) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/** Count unseen notifications for user. */
export async function getUnseenNotificationCount(userId: number): Promise<number> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.seenAt))
    );
  return rows.length;
}

/** Count unseen message notifications for user (for Messages nav badge). */
export async function getUnseenMessageNotificationCount(
  userId: number
): Promise<number> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, 'message'),
        isNull(notifications.seenAt)
      )
    );
  return rows.length;
}

/** Mark a notification as seen; returns false if not found or not owned by user. */
export async function markNotificationSeen(
  notificationId: string,
  userId: number
): Promise<boolean> {
  const [updated] = await db
    .update(notifications)
    .set({ seenAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .returning({ id: notifications.id });
  return !!updated;
}

/** Mark all notifications for user as seen. */
export async function markAllNotificationsSeen(userId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ seenAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.seenAt)));
}

/** Mark message notifications for a conversation as seen (when user opens thread). */
export async function markMessageNotificationsSeenForConversation(
  userId: number,
  conversationId: string
): Promise<void> {
  await db
    .update(notifications)
    .set({ seenAt: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, 'message'),
        eq(notifications.sourceId, conversationId),
        isNull(notifications.seenAt)
      )
    );
}
