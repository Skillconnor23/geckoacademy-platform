import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import {
  getNotifications,
  getUnseenNotificationCount,
  getUnseenMessageNotificationCount,
} from '@/lib/db/queries/notifications';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [notifications, unseenCount, unseenMessageCount] = await Promise.all([
    getNotifications(user.id, 20),
    getUnseenNotificationCount(user.id),
    getUnseenMessageNotificationCount(user.id),
  ]);

  return NextResponse.json({
    notifications,
    unseenCount,
    unseenMessageCount,
  });
}
