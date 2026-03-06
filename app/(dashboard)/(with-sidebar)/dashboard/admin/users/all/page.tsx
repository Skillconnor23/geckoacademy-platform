export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/auth/permissions';
import {
  getUsersForAdmin,
  getActiveClassesCountByStudent,
  listClasses,
  listClassesWithScheduleForAssign,
} from '@/lib/db/queries/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { AdminUsersFilters } from '../admin-users-filters';
import { AdminUsersTable } from '../admin-users-table';

export default async function AdminAllUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    role?: string;
    assignment?: string;
    status?: string;
    search?: string;
    classId?: string;
    geckoLevel?: string;
  }>;
}) {
  await requirePermission(['classes:read', 'users:read']);
  const params = await searchParams;

  const [users, classesCount, classes, classesForAssign] = await Promise.all([
    getUsersForAdmin({
      role: params.role || undefined,
      assignment:
        params.assignment === 'unassigned' || params.assignment === 'assigned'
          ? params.assignment
          : undefined,
      status:
        params.status === 'archived' || params.status === 'all'
          ? params.status
          : undefined,
      search: params.search || undefined,
      classId: params.classId || undefined,
      geckoLevel: params.geckoLevel || undefined,
    }),
    getActiveClassesCountByStudent(),
    listClasses(),
    listClassesWithScheduleForAssign(),
  ]);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/dashboard/admin/users"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Users
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-lg lg:text-2xl font-medium flex items-center gap-2">
            <Users className="h-6 w-6" />
            All Users
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users directory</CardTitle>
            <p className="text-sm text-muted-foreground">
              View and filter users by role, class, gecko level, or assignment
              status.
            </p>
            <AdminUsersFilters
              classes={classes.map((c) => ({
                id: c.id,
                name: c.name,
                geckoLevel: c.geckoLevel,
              }))}
              currentParams={params}
            />
          </CardHeader>
          <CardContent>
            <AdminUsersTable
              users={users}
              classesCount={classesCount}
              classesForAssign={classesForAssign}
              statusFilter={
                params.status === 'archived' || params.status === 'all'
                  ? params.status
                  : 'active'
              }
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
