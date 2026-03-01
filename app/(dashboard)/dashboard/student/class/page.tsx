export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/user';
import { getPrimaryClassForStudent } from '@/lib/db/queries/education';

/** Redirect to canonical classroom route. */
export default async function StudentClassPage() {
  const user = await requireRole(['student']);
  const primaryClass = await getPrimaryClassForStudent(user.id);

  if (!primaryClass) {
    redirect('/dashboard/student/join');
  }

  redirect(`/classroom/${primaryClass.id}`);
}
