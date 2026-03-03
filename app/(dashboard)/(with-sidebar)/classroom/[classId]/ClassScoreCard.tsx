import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  classAverage30d: number | null;
  attemptRate30d: number | null;
  lastActivity: string | null;
};

export function ClassScoreCard({
  classAverage30d,
  attemptRate30d,
  lastActivity,
}: Props) {
  return (
    <Card className="rounded-2xl border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-2">
        <CardTitle>Class progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-[#9ca3af]">Class average (30d)</p>
          <p className="text-2xl font-bold text-[#1f2937]">
            {classAverage30d != null ? `${classAverage30d}%` : '—'}
          </p>
        </div>
        {classAverage30d == null ? (
          <p className="text-sm text-muted-foreground">No scores yet</p>
        ) : (
          <>
            <div>
              <p className="text-xs text-[#9ca3af]">Quiz attempt rate (30d)</p>
              <p className="text-sm font-semibold text-[#1f2937]">
                {attemptRate30d != null ? `${attemptRate30d}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#9ca3af]">Last activity</p>
              <p className="text-sm font-semibold text-[#1f2937]">
                {lastActivity ?? '—'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
