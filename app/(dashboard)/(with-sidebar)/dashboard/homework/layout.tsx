import { requireRole } from '@/lib/auth/user';

export default async function HomeworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(['admin', 'school_admin', 'teacher']);
  return <>{children}</>;
}
