import { redirect } from 'next/navigation';
import { requirePlatformRole } from '@/lib/auth/user';
import { getPrimaryClassForStudent } from '@/lib/db/queries/education';
import { DashboardSidebar } from './dashboard-sidebar';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requirePlatformRole();
  const studentPrimaryClassId =
    user.platformRole === 'student'
      ? (await getPrimaryClassForStudent(user.id))?.id ?? null
      : null;
  return (
    <DashboardSidebar
      platformRole={user.platformRole}
      studentPrimaryClassId={studentPrimaryClassId}
    >
      {children}
    </DashboardSidebar>
  );
}
