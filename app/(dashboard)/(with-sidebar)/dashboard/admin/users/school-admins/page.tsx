export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/auth/permissions';
import { getUsersForAdmin } from '@/lib/db/queries/education';
import { getSchoolIdsForUser } from '@/lib/db/queries/schools';
import { getSchoolById } from '@/lib/db/queries/schools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function AdminSchoolAdminsPage() {
  await requirePermission(['classes:read', 'users:read']);
  const schoolAdmins = await getUsersForAdmin({ role: 'school_admin' });

  const adminsWithSchools = await Promise.all(
    schoolAdmins.map(async (a) => {
      const schoolIds = await getSchoolIdsForUser(a.id);
      const schools = await Promise.all(
        schoolIds.map((id) => getSchoolById(id))
      );
      return {
        ...a,
        schools: schools.filter(Boolean),
      };
    })
  );

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
            <Building2 className="h-6 w-6" />
            School Admins
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>School Admins</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage school administrators and their assigned schools.
            </p>
          </CardHeader>
          <CardContent>
            {adminsWithSchools.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">
                No school admins found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned schools</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminsWithSchools.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.name ?? a.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.email}
                      </TableCell>
                      <TableCell>
                        {a.schools.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {a.schools
                              .filter(Boolean)
                              .map((s) => (
                                <Link
                                  key={s!.id}
                                  href={`/dashboard/admin/schools/${s!.id}`}
                                  className="text-sm text-primary hover:underline"
                                >
                                  {s!.name}
                                </Link>
                              ))}
                          </div>
                        )}
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
