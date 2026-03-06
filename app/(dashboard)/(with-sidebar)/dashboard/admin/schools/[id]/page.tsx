export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getSchoolById, listSchoolMemberships, listClassesForSchool } from '@/lib/db/queries/schools';
import { listClasses } from '@/lib/db/queries/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { SchoolEditForm } from './SchoolEditForm';
import { SchoolAdminsSection } from './SchoolAdminsSection';
import { AssignClassToSchoolForm } from './AssignClassToSchoolForm';
import { CreateClassForSchoolForm } from './CreateClassForSchoolForm';

type Props = { params: Promise<{ id: string }> };

export default async function AdminSchoolDetailPage({ params }: Props) {
  await requirePermission('classes:read');
  const { id } = await params;
  const school = await getSchoolById(id);
  if (!school) notFound();

  const [memberships, schoolClasses, allClasses] = await Promise.all([
    listSchoolMemberships(id),
    listClassesForSchool(id),
    listClasses(),
  ]);

  const unassignedClasses = allClasses.filter((c) => !c.schoolId);
  const otherSchoolClasses = allClasses.filter((c) => c.schoolId && c.schoolId !== id);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Link
        href="/dashboard/admin/schools"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to schools
      </Link>

      <h1 className="text-lg lg:text-2xl font-medium mb-2">{school.name}</h1>
      <p className="text-sm text-muted-foreground mb-6">Slug: {school.slug}</p>

      <div className="space-y-6 max-w-4xl">
        <SchoolEditForm school={school} />

        <Card>
          <CardHeader>
            <CardTitle>School admins</CardTitle>
            <p className="text-sm text-muted-foreground">
              Users with school_admin role assigned to this school can manage this school&apos;s classes and students.
            </p>
          </CardHeader>
          <CardContent>
            <SchoolAdminsSection
              schoolId={id}
              memberships={memberships}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes in this school</CardTitle>
            <p className="text-sm text-muted-foreground">
              Classes in this school are visible to school admins. Create a new class or assign an existing one.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {schoolClasses.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Current classes</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolClasses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-right">
                          <AssignClassToSchoolForm classId={c.id} currentSchoolId={id} unassign />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {schoolClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">No classes in this school yet.</p>
            )}
            <div>
              <p className="text-sm font-medium mb-2">Create new class for this school</p>
              <CreateClassForSchoolForm schoolId={id} />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Assign existing class to this school</p>
              <AssignClassToSchoolForm
                classId={null}
                currentSchoolId={id}
                unassignedClasses={unassignedClasses}
                otherSchoolClasses={otherSchoolClasses}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
