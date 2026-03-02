export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requireRole } from '@/lib/auth/user';
import {
  getClassesForTeacherWithDetails,
  listUpcomingSessionsForTeacher,
} from '@/lib/db/queries/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { TeacherMyClasses } from './teacher-my-classes';

export default async function TeacherDashboardPage() {
  const user = await requireRole(['teacher']);
  const [classesWithDetails, sessions] = await Promise.all([
    getClassesForTeacherWithDetails(user.id),
    listUpcomingSessionsForTeacher(user.id, 10),
  ]);

  return (
    <section className="flex-1">
      <h1 className="text-xl lg:text-2xl font-medium text-[#1f2937] mb-2 tracking-tight">
        Teacher Dashboard
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Your classes and upcoming sessions
      </p>

      <TeacherMyClasses classes={classesWithDetails} />

      <Card className="mb-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#429ead]" aria-hidden />
            Next sessions
          </CardTitle>
        </CardHeader>
      <CardContent>
              {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No upcoming sessions.
          </p>
        ) : (
          <Table>
                  <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Meeting</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                    {sessions.map(({ session, className, classId }) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/classroom/${classId}`}
                      className="text-primary hover:underline"
                    >
                      {session.title ?? className}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(session.startsAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {session.meetingUrl ? (
                        <Button variant="secondary" size="sm" asChild>
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join
                        </a>
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        Join
                      </Button>
                    )}
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
