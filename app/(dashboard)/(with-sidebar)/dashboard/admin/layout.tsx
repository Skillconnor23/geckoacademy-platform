import { requirePermission } from '@/lib/auth/permissions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission(['classes:write']);
  return <>{children}</>;
}
