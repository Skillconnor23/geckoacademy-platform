export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requirePlatformRole } from '@/lib/auth/user';
import {
  getMessageableRecipients,
  listConversationsForUser,
  getConversationThread,
  startConversation,
} from '@/lib/db/queries/messaging';
import { markMessageNotificationsSeenForConversation } from '@/lib/db/queries/notifications';
import { MessagesView } from './messages-view';

type Props = {
  searchParams: Promise<{ c?: string; start?: string }>;
};

function truncate(s: string, max = 50): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 3) + '...';
}

export default async function MessagesPage({ searchParams }: Props) {
  const user = await requirePlatformRole();
  const params = await searchParams;
  const selectedId = params.c ?? null;

  // Support ?start=recipientId for links from roster/student profile
  if (params.start && !selectedId) {
    const recipientId = parseInt(params.start, 10);
    if (!isNaN(recipientId) && recipientId > 0) {
      const result = await startConversation(user.id, recipientId);
      if (result.success) {
        redirect(`/dashboard/messages?c=${result.conversationId}`);
      }
    }
  }

  const [conversations, recipients, thread] = await Promise.all([
    listConversationsForUser(user.id),
    getMessageableRecipients(user.id, user.platformRole),
    selectedId ? getConversationThread(selectedId, user.id) : Promise.resolve(null),
  ]);

  if (thread && selectedId) {
    await markMessageNotificationsSeenForConversation(user.id, selectedId);
  }

  const threadData = thread
    ? {
        conversationId: thread.conversation.id,
        otherUser: thread.otherUser,
        messages: thread.messages,
      }
    : null;

  return (
    <MessagesView
      role={user.platformRole}
      currentUserId={user.id}
      conversations={conversations.map((c) => ({
        id: c.id,
        otherUser: c.otherUser,
        lastMessage: c.lastMessage
          ? {
              body: truncate(c.lastMessage.body),
              createdAt: c.lastMessage.createdAt,
            }
          : null,
      }))}
      recipients={recipients}
      selectedId={selectedId}
      thread={threadData}
    />
  );
}
