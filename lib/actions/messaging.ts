'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import {
  getConversationThread,
  listConversationsForUser,
  sendMessage as sendMessageQuery,
  startConversation as startConversationQuery,
} from '@/lib/db/queries/messaging';
import { requirePlatformRole } from '@/lib/auth/user';

/** List conversations for the current user. */
export async function listConversationsForUserAction() {
  const user = await requirePlatformRole();
  return listConversationsForUser(user.id);
}

/** Get conversation thread (permission check via membership). */
export async function getConversationThreadAction(conversationId: string) {
  const user = await requirePlatformRole();
  const thread = await getConversationThread(conversationId, user.id);
  return thread;
}

/** Start a conversation with recipientId. Enforces canMessage + class relationship server-side. */
export async function startConversationAction(recipientId: number) {
  const user = await requirePlatformRole();
  const result = await startConversationQuery(user.id, recipientId);
  if (result.success) {
    revalidatePath('/dashboard/messages');
    redirect(`/dashboard/messages?c=${result.conversationId}`);
  }
  return result;
}

/** Send a message. Requires membership. */
export async function sendMessageAction(
  conversationId: string,
  body: string
) {
  const user = await getUser();
  if (!user) return { success: false as const, error: 'Not signed in.' };
  const result = await sendMessageQuery(conversationId, user.id, body);
  if (result.success) {
    revalidatePath('/dashboard/messages');
    revalidatePath(`/dashboard/messages?c=${conversationId}`);
  }
  return result;
}
