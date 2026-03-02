export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requireRole } from '@/lib/auth/user';
import { getStudentDashboardData } from '@/lib/db/queries/education';
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
import { Calendar, BookOpen } from 'lucide-react';

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ joined?: string }>;
}) {
  const user = await requireRole(['student']);
  const params = await searchParams;
  const data = await getStudentDashboardData(user.id);

  return (
    <section className="flex-1">
      <h1 className="text-xl lg:text-2xl font-medium text-[#1f2937] mb-2 tracking-tight">
        Student Dashboard
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Your classes and upcoming sessions
      </p>

      {params.joined === '1' && (
        <div className="mb-8 rounded-xl bg-[#7daf41]/10 px-5 py-4 text-sm text-[#1f2937]">
          You joined the class successfully. Your upcoming sessions appear below.
        </div>
      )}

      {!data.hasClasses ? (
        <Card>
          <CardHeader>
            <CardTitle>Your class</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Use a class code from your teacher to join, or contact support.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="primary">
              <Link href="/dashboard/student/join">Join with class code</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Your Class card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#7daf41]" aria-hidden />
                Your class
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium text-[#1f2937]">{data.primaryClass.name}</p>
              {(data.primaryClass.level || data.primaryClass.timezone) && (
                <p className="text-sm text-muted-foreground">
                  {[data.primaryClass.level, data.primaryClass.timezone]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              <Button asChild variant="primary" size="sm" className="mt-2">
                <Link href={`/classroom/${data.primaryClass.id}`}>Open classroom</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Next session */}
          {data.nextSessions.length > 0 && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#429ead]" aria-hidden />
                    Next session
                    <span className="ml-1 inline-flex rounded-full bg-[#429ead]/20 px-2.5 py-0.5 text-xs font-medium text-[#429ead]">
                      Upcoming
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="font-medium text-[#1f2937]">
                      {data.nextSessions[0].session.title ??
                        data.nextSessions[0].className}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.nextSessions[0].className}
                    </p>
                    <p className="text-sm">
                      {new Date(
                        data.nextSessions[0].session.startsAt
                      ).toLocaleString()}{' '}
                      —{' '}
                      {new Date(
                        data.nextSessions[0].session.endsAt
                      ).toLocaleTimeString()}
                    </p>
                    {data.nextSessions[0].session.meetingUrl ? (
                      <Button variant="secondary" size="sm" asChild>
                        <a
                          href={data.nextSessions[0].session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join meeting
                        </a>
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        Join meeting
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Next 5 sessions — blue family to match Next session */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#429ead]" aria-hidden />
                    Upcoming sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Meeting</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.nextSessions.map(({ session, className }) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {session.title ?? className}
                          </TableCell>
                          <TableCell>
                            {new Date(session.startsAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {session.meetingUrl ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={session.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Join
                                </a>
                              </Button>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {data.hasClasses && data.nextSessions.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No upcoming sessions scheduled. Check back later or ask your
                  teacher.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
