'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/db/queries';
import {
  markNotificationSeen,
  markAllNotificationsSeen,
} from '@/lib/db/queries/notifications';

export type MarkNotificationSeenResult =
  | { success: true }
  | { success: false; error: string };

export async function markNotificationSeenAction(
  notificationId: string
): Promise<MarkNotificationSeenResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not signed in.' };

  const ok = await markNotificationSeen(notificationId, user.id);
  if (!ok) return { success: false, error: 'Notification not found.' };

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function markAllNotificationsSeenAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not signed in.' };

  await markAllNotificationsSeen(user.id);
  revalidatePath('/', 'layout');
  return { success: true };
}
