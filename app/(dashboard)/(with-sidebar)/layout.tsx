import { requirePlatformRole } from '@/lib/auth/user';
import { getPrimaryClassForStudent } from '@/lib/db/queries/education';
import { getUnseenMessageNotificationCount } from '@/lib/db/queries/notifications';
import { DashboardSidebar } from './dashboard/dashboard-sidebar';

export default async function WithSidebarLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requirePlatformRole();
  const [studentPrimaryClassId, unreadMessageCount] = await Promise.all([
    user.platformRole === 'student'
      ? (await getPrimaryClassForStudent(user.id))?.id ?? null
      : null,
    getUnseenMessageNotificationCount(user.id),
  ]);
  return (
    <DashboardSidebar
      platformRole={user.platformRole}
      studentPrimaryClassId={studentPrimaryClassId}
      unreadMessageCount={unreadMessageCount}
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </DashboardSidebar>
  );
}
