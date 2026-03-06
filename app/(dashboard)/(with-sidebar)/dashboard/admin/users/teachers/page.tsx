export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/auth/permissions';
import { listTeachersWithClassCount } from '@/lib/db/queries/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function AdminTeachersPage() {
  await requirePermission(['classes:read', 'users:read']);
  const teachers = await listTeachersWithClassCount();

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
            <GraduationCap className="h-6 w-6" />
            Teachers
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teachers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage teachers, view their profiles, and assign or remove class
              assignments.
            </p>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">
                No teachers found.
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
                  {teachers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.name ?? t.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.email}
                      </TableCell>
                      <TableCell>{t.activeClassCount}</TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/admin/users/teachers/${t.id}`}
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
