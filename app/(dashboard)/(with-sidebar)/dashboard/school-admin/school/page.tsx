export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/user';
import {
  getSchoolIdsForUser,
  getSchoolById,
  getClassCountBySchoolId,
  getStudentCountBySchoolId,
} from '@/lib/db/queries/schools';
import { getSchoolAdminClassTable } from '@/lib/db/queries/school-admin-dashboard';
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
import { Building2, GraduationCap, Users } from 'lucide-react';
import { SchoolAdminSchoolForm } from './SchoolAdminSchoolForm';

export default async function SchoolAdminSchoolPage() {
  const user = await requireRole(['school_admin']);
  const t = await getTranslations('schoolAdmin');
  const schoolIds = await getSchoolIdsForUser(user.id);

  if (schoolIds.length === 0) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">My School</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/60 mb-4" />
            <h2 className="text-lg font-medium mb-1">No school assigned yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              You don’t have a school assigned to your account yet. Please contact an administrator to be assigned to a school. Once assigned, you’ll be able to manage your school’s name, view its classes, and see students here.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const schoolId = schoolIds[0]!;
  const [school, classRows, classCount, studentCount] = await Promise.all([
    getSchoolById(schoolId),
    getSchoolAdminClassTable(schoolIds),
    getClassCountBySchoolId(schoolId),
    getStudentCountBySchoolId(schoolId),
  ]);

  if (!school) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">My School</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/60 mb-4" />
            <h2 className="text-lg font-medium mb-1">No school assigned yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Please contact an administrator to be assigned to a school.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const tDashboard = await getTranslations('schoolAdmin.dashboard');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-2">My School</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Overview and settings for your school.
      </p>

      {/* School name / settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>School name</CardTitle>
          <p className="text-sm text-muted-foreground">
            Edit your school’s display name. Changes are visible to students and teachers.
          </p>
        </CardHeader>
        <CardContent>
          <SchoolAdminSchoolForm school={school} />
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{classCount}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{studentCount}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes in this school */}
      <Card>
        <CardHeader>
          <CardTitle>Classes in your school</CardTitle>
          <p className="text-sm text-muted-foreground">
            Classes belonging to {school.name}. Open a class to view details and students.
          </p>
        </CardHeader>
        <CardContent>
          {classRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {tDashboard('noClassesYet')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Quiz avg (30d)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classRows.map((r) => (
                  <TableRow key={r.classId}>
                    <TableCell className="font-medium">{r.className}</TableCell>
                    <TableCell>{r.teacherName ?? '—'}</TableCell>
                    <TableCell>{r.studentCount}</TableCell>
                    <TableCell>
                      {r.avgQuizScore30d != null ? `${r.avgQuizScore30d}%` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/classroom/${r.classId}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
