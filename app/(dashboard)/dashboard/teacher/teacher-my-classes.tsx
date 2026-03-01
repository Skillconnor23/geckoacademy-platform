import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, UsersRound } from 'lucide-react';

const DAY_DISPLAY: Record<string, string> = {
  sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat',
};

function formatScheduleSummary(c: {
  scheduleDays: unknown;
  scheduleStartTime: string | null;
  geckoLevel: string | null;
}): string {
  const days = Array.isArray(c.scheduleDays)
    ? (c.scheduleDays as string[]).map((d) =>
        DAY_DISPLAY[d?.toLowerCase?.().slice(0, 3)] ?? d
      ).filter(Boolean)
    : [];
  const time = c.scheduleStartTime ?? '—';
  const level = c.geckoLevel ?? '';
  const parts = [days.length ? days.join(' & ') : null, time, level].filter(Boolean);
  return parts.join(' · ') || '—';
}

type ClassWithDetails = {
  id: string;
  name: string;
  geckoLevel: string | null;
  scheduleDays: unknown;
  scheduleStartTime: string | null;
  scheduleTimezone: string | null;
  studentCount: number;
};

type Props = {
  classes: ClassWithDetails[];
};

export function TeacherMyClasses({ classes }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>My Classes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Classes you teach. View roster or open classroom.
        </p>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            You are not assigned to any classes yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <div
                key={c.id}
                className="flex flex-col rounded-lg border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{c.name}</h3>
                    {c.geckoLevel && (
                      <span className="mt-1 inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {c.geckoLevel}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatScheduleSummary(c)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.studentCount} student{c.studentCount !== 1 ? 's' : ''}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/classroom/${c.id}/people`}>
                      <UsersRound className="mr-1 h-4 w-4" />
                      Roster
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/classroom/${c.id}`}>
                      <BookOpen className="mr-1 h-4 w-4" />
                      Classroom
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
