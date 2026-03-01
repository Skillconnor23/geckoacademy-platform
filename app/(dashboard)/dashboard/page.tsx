import { redirect } from 'next/navigation';
import { requirePlatformRole } from '@/lib/auth/user';
import { getRoleDashboardPath } from '@/lib/auth/dashboard-redirect';

export default async function DashboardPage() {
  const user = await requirePlatformRole();
  redirect(getRoleDashboardPath(user.platformRole));
}
