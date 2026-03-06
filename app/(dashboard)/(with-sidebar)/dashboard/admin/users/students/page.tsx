export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/auth/permissions';
import { getUsersForAdmin, getActiveClassesCountByStudent } from '@/lib/db/queries/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function AdminStudentsPage() {
  await requirePermission(['classes:read', 'users:read']);
  const [students, classesCount] = await Promise.all([
    getUsersForAdmin({ role: 'student' }),
    getActiveClassesCountByStudent(),
  ]);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto w-full max-w-4xl">
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
            Students
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <p className="text-sm text-muted-foreground">
              View students, see their enrolled classes, and manage accounts.
            </p>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">
                No students found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Active classes</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.name ?? s.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.email}
                      </TableCell>
                      <TableCell>
                        {classesCount.get(s.id) ?? 0}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/students/${s.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
