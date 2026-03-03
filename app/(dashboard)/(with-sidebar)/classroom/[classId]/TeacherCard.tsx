import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  teacher: {
    id: number;
    name: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  };
};

function getInitials(name: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TeacherCard({ teacher }: Props) {
  const bio =
    teacher.bio ||
    'Your teacher will post recordings, homework, and quizzes here.';

  return (
    <Card className="rounded-2xl border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-2">
        <CardTitle>Your teacher</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#7daf41]/20 text-xl font-semibold text-[#7daf41]"
            aria-hidden
          >
            {teacher.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacher.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(teacher.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[#1f2937]">
              {teacher.name ?? 'Teacher'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {bio}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
