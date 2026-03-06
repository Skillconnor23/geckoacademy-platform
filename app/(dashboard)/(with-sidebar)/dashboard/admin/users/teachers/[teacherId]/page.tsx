export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/auth/permissions';
import {
  getUserById,
  getClassesForTeacherWithDetails,
  listClassesWithScheduleForAssign,
} from '@/lib/db/queries/education';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { TeacherDetailActions } from './TeacherDetailActions';

export default async function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  await requirePermission(['classes:read', 'users:read']);
  const { teacherId } = await params;
  const teacherIdNum = parseInt(teacherId, 10);
  if (!Number.isInteger(teacherIdNum) || teacherIdNum <= 0) notFound();

  const [teacher, assignedClasses, allClassesForAssign] = await Promise.all([
    getUserById(teacherIdNum),
    getClassesForTeacherWithDetails(teacherIdNum),
    listClassesWithScheduleForAssign(),
  ]);

  if (!teacher || (teacher.platformRole as string) !== 'teacher') notFound();

  const assignedClassIds = new Set(assignedClasses.map((c) => c.id));
  const classesAvailableToAssign = allClassesForAssign.filter(
    (c) => !assignedClassIds.has(c.id)
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
          <Link
            href="/dashboard/admin/users/teachers"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Teachers
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-lg lg:text-2xl font-medium flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            {teacher.name ?? teacher.email}
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p>
              <span className="text-muted-foreground">Email:</span>{' '}
              {teacher.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span> Teacher
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assigned classes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Classes this teacher is currently assigned to teach.
                </p>
              </div>
              <TeacherDetailActions
                teacherId={teacherIdNum}
                assignedClassIds={Array.from(assignedClassIds)}
                classesAvailableToAssign={classesAvailableToAssign.map((c) => ({
                  id: c.id,
                  name: c.name,
                  geckoLevel: c.geckoLevel,
                }))}
              />
            </div>
          </CardHeader>
          <CardContent>
            {assignedClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No classes assigned yet. Use &quot;Assign to class&quot; to add
                assignments.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedClasses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/admin/classes/${c.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.geckoLevel ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {c.scheduleDays && Array.isArray(c.scheduleDays)
                          ? (c.scheduleDays as string[]).join(', ')
                          : '—'}{' '}
                        {c.scheduleStartTime ?? ''}
                      </TableCell>
                      <TableCell>{c.studentCount}</TableCell>
                      <TableCell>
                        <TeacherDetailActions
                          teacherId={teacherIdNum}
                          removeOnly
                          removeClassId={c.id}
                          removeClassName={c.name}
                        />
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
