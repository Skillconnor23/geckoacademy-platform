import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClassmatePreview } from '@/lib/db/queries/education';

function getInitials(name: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type Props = {
  classId: string;
  classmates: ClassmatePreview[];
  total: number;
};

const AVATAR_SIZE = 36;
const OVERLAP = -8;
const VISIBLE_COUNT = 5;

export function ClassmatesCard({ classId, classmates, total }: Props) {
  const display = classmates.slice(0, VISIBLE_COUNT);
  const remaining = total - display.length;

  return (
    <Link href={`/classroom/${classId}/people`} className="block transition-opacity hover:opacity-90">
      <Card className="rounded-2xl border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Classmates</CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="text-sm text-muted-foreground">No classmates yet.</p>
          ) : (
            <div className="flex items-center overflow-visible">
              {display.map((c, i) => (
                <div
                  key={c.studentId}
                  className="flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-muted text-xs font-medium text-muted-foreground ring-1 ring-[#e5e7eb]"
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    marginLeft: i > 0 ? OVERLAP : 0,
                  }}
                  title={c.studentName ?? undefined}
                >
                  {c.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatarUrl}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(c.studentName)
                  )}
                </div>
              ))}
              {remaining > 0 && (
                <span
                  className="flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-muted px-2 text-xs font-medium text-muted-foreground ring-1 ring-[#e5e7eb]"
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    marginLeft: display.length > 0 ? OVERLAP : 0,
                  }}
                >
                  +{remaining}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
